/**
 * Initialize flash message storage and provide access methods
 */
const flashMiddleware = (req, res, next) => {
    let sessionNeedsSave = false;
    const originalRedirect = res.redirect.bind(res);
    
    res.redirect = (...args) => {
        if (sessionNeedsSave && req.session) {
            // Save session before redirecting
            req.session.save(() => {
                originalRedirect.apply(res, args);
            });
        } else {
            originalRedirect.apply(res, args);
        }
    };
    /**
    * The flash function handles both setting and getting messages
    */
    req.flash = function(type, message) {

        if (!req.session) {
            if (type && message) {
                return; 
            }
            // If getting messages, return empty structure
            return { success: [], error: [], warning: [], info: [] };
        }
        // Initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            req.session.flash = {
                success: [],
                error: [],
                warning: [],
                info: []
            };
        }
        if (type && message) {
            // Ensure this message type's array exists
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            // Add the message to the appropriate type array
            req.session.flash[type].push(message);
            // Mark that session needs to be saved before redirect
            sessionNeedsSave = true;
            return;
        }

        if (type && !message) {
            const messages = req.session.flash[type] || [];
            // Clear this type's messages after retrieving
            req.session.flash[type] = [];
            return messages;
        }

        const allMessages = req.session.flash || {
            success: [],
            error: [],
            warning: [],
            info: []
        };
        // Clear all flash messages after retrieving
        req.session.flash = {
            success: [],
            error: [],
            warning: [],
            info: []
        };
        return allMessages;
    };
    next();
};
/**
* Make flash function available to all templates via res.locals
* This middleware must run AFTER flashMiddleware
*/
const flashLocals = (req, res, next) => {
    res.locals.flash = req.flash;
    next();
};
/**
* Combined flash middleware
*/
const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};
export default flash;