const BioPage = require('../models/BioPage.model');
const { success, error } = require('../utils/apiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Get or create user bio page
// @route GET /api/bio/me
const getMyBioPage = asyncHandler(async (req, res) => {
    let bioPage = await BioPage.findOne({ user: req.user._id });
    if (!bioPage) {
        bioPage = await BioPage.create({
            user: req.user._id,
            username: req.user.username,
            displayName: req.user.name,
            avatar: req.user.avatar,
            bio: req.user.bio || ''
        });
    }
    return success(res, 'Bio page fetched.', { bioPage });
});

// @desc  Update bio page
// @route PUT /api/bio/me
const updateBioPage = asyncHandler(async (req, res) => {
    const { displayName, bio, theme, primaryColor, secondaryColor, links, socialProfiles, seoTitle, seoDescription } = req.body;

    let bioPage = await BioPage.findOne({ user: req.user._id });
    if (!bioPage) return error(res, 'Bio page not found.', 404);

    if (displayName !== undefined) bioPage.displayName = displayName;
    if (bio !== undefined) bioPage.bio = bio;
    if (theme !== undefined) bioPage.theme = theme;
    if (primaryColor !== undefined) bioPage.primaryColor = primaryColor;
    if (secondaryColor !== undefined) bioPage.secondaryColor = secondaryColor;
    if (links !== undefined) bioPage.links = links;
    if (socialProfiles !== undefined) bioPage.socialProfiles = socialProfiles;
    if (seoTitle !== undefined) bioPage.seoTitle = seoTitle;
    if (seoDescription !== undefined) bioPage.seoDescription = seoDescription;

    await bioPage.save();
    return success(res, 'Bio page updated.', { bioPage });
});

// @desc  Get public bio page by username
// @route GET /api/bio/:username
const getPublicBioPage = asyncHandler(async (req, res) => {
    const bioPage = await BioPage.findOne({ username: req.params.username, isPublic: true }).lean();
    if (!bioPage) return error(res, 'Bio page not found.', 404);

    // Increment view count
    await BioPage.findByIdAndUpdate(bioPage._id, { $inc: { 'stats.totalViews': 1 } });

    return success(res, 'Bio page fetched.', { bioPage });
});

// @desc  Record bio link click
// @route POST /api/bio/:username/click/:linkIndex
const recordBioClick = asyncHandler(async (req, res) => {
    const { username, linkIndex } = req.params;
    await BioPage.findOneAndUpdate(
        { username },
        { $inc: { [`links.${linkIndex}.clicks`]: 1, 'stats.totalClicks': 1 } }
    );
    return success(res, 'Click recorded.');
});

module.exports = { getMyBioPage, updateBioPage, getPublicBioPage, recordBioClick };
