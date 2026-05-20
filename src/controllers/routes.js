import {
Router
}
from 'express';

import {
homePage,
aboutPage,
demoPage,
studentPage
}
from './index.js';

import {
catalogPage,
courseDetailPage
}
from './catalog/catalog.js';

import {
addDemoHeaders
}
from '../middleware/demo/headers.js';

const router =
Router();

router.get(
'/',
homePage
);

router.get(
'/about',
aboutPage
);

router.get(
    '/student',
    studentPage
);

router.get(
'/catalog',
catalogPage
);

router.get(
'/catalog/:courseId',
courseDetailPage
);

router.get(
'/demo',
addDemoHeaders,
demoPage
);

export default router;