const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

const register = async ({ name, email, password, role }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    const token = generateToken(user);
    return { user: { id: user.id, name, email, role }, token };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Credenciais inválidas');
    }
    const token = generateToken(user);
    return { user: { id: user.id, name: user.name, email, role: user.role }, token };
};

module.exports = { register, login };