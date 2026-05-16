// Course data
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        department: 'Computer Science',
        description:
            'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time:'9:00 AM', room:'STC 392', professor:'Brother Jack' },
            { time:'2:00 PM', room:'STC 394', professor:'Sister Enkey' },
            { time:'11:00 AM', room:'STC 390', professor:'Brother Keers' }
        ]
    },

    'MATH110': {
        id:'MATH110',
        title:'College Algebra',
        department:'Mathematics',
        description:
            'Fundamental algebra concepts.',
        credits:4,
        sections:[
            { time:'8:00 AM', room:'MC301', professor:'Sister Anderson' },
            { time:'1:00 PM', room:'MC305', professor:'Brother Miller' }
        ]
    },

    'ENG101': {
        id:'ENG101',
        title:'Academic Writing',
        department:'English',
        description:
            'Develop writing skills.',
        credits:3,
        sections:[
            { time:'10:00 AM', room:'GEB201', professor:'Sister Anderson' }
        ]
    }
};


const getAllCourses = () => {
    return courses;
};


const getCourseById = (courseId) => {
    return courses[courseId] || null;
};


const getSortedSections = (sections, sortBy) => {

    const sorted = [...sections];

    switch(sortBy){

        case 'professor':
            return sorted.sort(
                (a,b)=>
                a.professor.localeCompare(
                    b.professor
                )
            );

        case 'room':
            return sorted.sort(
                (a,b)=>
                a.room.localeCompare(
                    b.room
                )
            );

        default:
            return sorted;
    }

};


export {

    getAllCourses,
    getCourseById,
    getSortedSections

};