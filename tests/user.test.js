import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/user.js'
import { userOneId, userOne, setupDatabase } from './fixtures/db.js'

beforeEach(setupDatabase)

test('Should singup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Natalia',
        email: 'example.natalia@example.com',
        password: 'ExamplePass12'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    
    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Natalia',
            email: 'example.natalia@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('ExamplePass12')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexistinguser@example.com',
        password: 'nonexistingpassword12*('
    }).expect(400)
})

test('Should get profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauth user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauth user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "UserTest2"
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('UserTest2')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Poland'
        })
        .expect(400)
})