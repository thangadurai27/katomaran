const express = require('express');
const router = express.Router();
const Team = require('../models/Team.model');
const { success, error } = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth.middleware');
const { slugify } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

// Get user's teams
router.get('/', asyncHandler(async (req, res) => {
    const teams = await Team.find({ 'members.user': req.user._id }).populate('owner', 'name avatar email').lean();
    return success(res, 'Teams fetched.', { teams });
}));

// Create team
router.post('/', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    let slug = slugify(name);
    const slugExists = await Team.findOne({ slug });
    if (slugExists) slug = slug + '-' + Date.now();

    const team = await Team.create({
        name, description, slug,
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'owner', joinedAt: new Date() }]
    });

    return success(res, 'Team created.', { team }, 201);
}));

// Get team by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const team = await Team.findOne({ _id: req.params.id, 'members.user': req.user._id })
        .populate('members.user', 'name email avatar')
        .populate('owner', 'name email avatar');
    if (!team) return error(res, 'Team not found.', 404);
    return success(res, 'Team fetched.', { team });
}));

// Invite member
router.post('/:id/invite', asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return error(res, 'Team not found or unauthorized.', 404);

    const token = require('crypto').randomBytes(32).toString('hex');
    team.invitations.push({ email, role: role || 'viewer', token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), invitedBy: req.user._id });
    await team.save();

    return success(res, `Invitation sent to ${email}.`, { token });
}));

// Remove member
router.delete('/:id/members/:memberId', asyncHandler(async (req, res) => {
    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return error(res, 'Team not found or unauthorized.', 404);

    team.members = team.members.filter(m => m.user.toString() !== req.params.memberId);
    await team.save();
    return success(res, 'Member removed.');
}));

module.exports = router;
