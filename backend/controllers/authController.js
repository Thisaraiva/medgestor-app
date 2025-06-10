const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { register, login };