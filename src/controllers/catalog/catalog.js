import {
    getAllCourses,
    getCourseById,
    getSortedSections
}

from '../../models/catalog/catalog.js';

const catalogPage = (req,res)=>{
    const courses =
        getAllCourses();

    res.render(
        'catalog',
        {
            title:'Course Catalog',
            courses
        }
    );
};

const courseDetailPage =
(req,res,next)=>{
    const course =
        getCourseById(
            req.params.courseId
        );

    if(!course){
        const err =
            new Error(
                'Course not found'
            );
        err.status = 404;
        return next(err);
    }

    const sortBy =
        req.query.sort || 'time';

    const sortedSections =
        getSortedSections(
            course.sections,
            sortBy
        );

    res.render(
        'course-detail',
        {
            title:
            `${course.id}
             ${course.title}`,
            course:{
                ...course,
                sections:
                sortedSections
            },

            currentSort:
            sortBy
        }
    );
};

export {
    catalogPage,
    courseDetailPage
};