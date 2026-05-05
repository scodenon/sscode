import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Application } from 'express'
import request from 'supertest'

function prismaBinPath() {
  return process.platform === 'win32'
    ? path.resolve('node_modules/.bin/prisma.cmd')
    : path.resolve('node_modules/.bin/prisma')
}

function runPrisma(args: string[], env: NodeJS.ProcessEnv) {
  const prismaPath = prismaBinPath()
  if (process.platform === 'win32') {
    execFileSync('cmd.exe', ['/c', prismaPath, ...args], {
      cwd: path.resolve('.'),
      env,
      stdio: 'pipe',
    })
    return
  }

  execFileSync(prismaPath, args, {
    cwd: path.resolve('.'),
    env,
    stdio: 'pipe',
  })
}

const schemaPath = path.resolve('api/prisma/schema.prisma')
const databaseUrl = process.env.DATABASE_URL_TEST

process.env.JWT_SECRET =
  process.env.JWT_SECRET ??
  'clave-de-pruebas-para-jwt-debe-ser-larga-y-no-se-usa-en-produccion'

let app: Application

if (!databaseUrl) {
  describe.skip('Money API', () => {
    it('requiere DATABASE_URL_TEST para ejecutar tests de API', () => {})
  })
} else {
  beforeAll(async () => {
    runPrisma(
      ['db', 'execute', '--schema', schemaPath, '--file', 'api/prisma/test-reset.sql'],
      {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    )

    runPrisma(['migrate', 'deploy', '--schema', schemaPath], {
      ...process.env,
      DATABASE_URL: databaseUrl,
    })

    const imported = await import('../app.js')
    app = imported.default
  })

  afterAll(async () => {
    const { prisma } = await import('../db/prisma.js')
    await prisma.$disconnect()
  })

  describe('Money API', () => {
  it('register/login y /api/me funcionan', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      email: 'a@example.com',
      password: 'password123',
      name: 'A',
    })
    expect(reg.status).toBe(201)
    expect(reg.body.token).toBeTypeOf('string')
    expect(reg.body.user.email).toBe('a@example.com')

    const login = await request(app).post('/api/auth/login').send({
      email: 'a@example.com',
      password: 'password123',
    })
    expect(login.status).toBe(200)
    expect(login.body.token).toBeTypeOf('string')

    const me = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${login.body.token}`)
    expect(me.status).toBe(200)
    expect(me.body.user.email).toBe('a@example.com')
  })

  it('CRUD de cuentas y transacciones (aislamiento por usuario)', async () => {
    const u1 = await request(app).post('/api/auth/register').send({
      email: 'u1@example.com',
      password: 'password123',
    })
    const token1 = u1.body.token as string

    const u2 = await request(app).post('/api/auth/register').send({
      email: 'u2@example.com',
      password: 'password123',
    })
    const token2 = u2.body.token as string

    const createAcc = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Cuenta principal',
        type: 'bank',
        currency: 'EUR',
        initialBalance: 10.5,
      })
    expect(createAcc.status).toBe(201)
    expect(createAcc.body.account.initialBalance).toBe(10.5)

    const accountId = createAcc.body.account.id as string

    const otherUserCannotGet = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token2}`)
    expect(otherUserCannotGet.status).toBe(404)

    const createTx = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        accountId,
        type: 'expense',
        amount: 3.25,
        currency: 'EUR',
        description: 'Café',
        occurredAt: new Date().toISOString(),
      })
    expect(createTx.status).toBe(201)
    expect(createTx.body.transaction.amount).toBe(3.25)

    const listTx = await request(app)
      .get(`/api/transactions?accountId=${accountId}`)
      .set('Authorization', `Bearer ${token1}`)
    expect(listTx.status).toBe(200)
    expect(listTx.body.items.length).toBeGreaterThan(0)
  })
  })
}

