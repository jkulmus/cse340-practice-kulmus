import { Router } from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';

import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { 
    facultyListPage, 
    facultyDetailPage 
} 
from './faculty/faculty.js';

import { 
    homePage, 
    aboutPage, 
    demoPage, 
    studentPage,
    testErrorPage 
} from './index.js';

const router = Router();

/**
 * Home / Static 
 */
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/student', studentPage);

/**
 * Catalog
 */
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);

/**
 * Faculty
 */
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

/**
 * Demo
 */
router.get('/demo', addDemoHeaders, demoPage);

/**
 * Error Test
 */
router.get('/test-error', testErrorPage);

export default router;
