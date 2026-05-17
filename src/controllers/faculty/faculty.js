import { 
    getFacultyById, 
    getSortedFaculty 
} 
from "../../models/faculty/faculty.js";

// List page
const facultyListPage = (req, res) => {
    const sort = 
        req.query.sort || 'name';

    const faculty = 
        getSortedFaculty(sort);

    res.render(
        'faculty/list', 
        {
            title: 'Faculty Directory',
            faculty,
            sort
        }
    );
};

// Detail page
const facultyDetailPage = 
(req, res) => {
    const facultyId = 
        req.params.facultyId;

    const member = 
        getFacultyById(facultyId);

    if (!member) {
        return res
            .status(404)
            .render(
                'errors/404', 
                {
                    title: 
                    'Page Not Found'
                }
            );
    }

    res.render(
        'faculty/detail', 
        {
            title: 
            member.name,

            faculty: 
            member
        }
    );
};

export { 
    facultyListPage, 
    facultyDetailPage 
};