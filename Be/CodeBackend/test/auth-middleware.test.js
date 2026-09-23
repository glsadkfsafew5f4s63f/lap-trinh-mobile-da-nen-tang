const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { requireAdmin } = require('../middleware/auth');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function responseMock() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test('rejects requests without a token', () => {
    const response = responseMock();
    let called = false;
    requireAdmin({ headers: {} }, response, () => { called = true; });

    assert.equal(response.statusCode, 401);
    assert.equal(called, false);
});

test('rejects authenticated non-admin users', () => {
    const token = jwt.sign({ id: 2, roleId: 2, role: 'Customer' }, process.env.JWT_SECRET);
    const response = responseMock();
    let called = false;
    requireAdmin({ headers: { authorization: `Bearer ${token}` } }, response, () => { called = true; });

    assert.equal(response.statusCode, 403);
    assert.equal(called, false);
});

test('allows authenticated admins', () => {
    const token = jwt.sign({ id: 1, roleId: 1, role: 'Admin' }, process.env.JWT_SECRET);
    const response = responseMock();
    let called = false;
    requireAdmin({ headers: { authorization: `Bearer ${token}` } }, response, () => { called = true; });

    assert.equal(response.statusCode, 200);
    assert.equal(called, true);
});
