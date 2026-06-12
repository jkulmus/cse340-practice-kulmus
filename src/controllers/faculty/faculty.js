import { getFacultyBySlug, getSortedFaculty } from "../../models/faculty/faculty.js";

// List page
const facultyListPage = async (req, res, next) => {
  const sort = req.query.sort || "name";

  const faculty = await getSortedFaculty(sort);

  res.render("faculty/list", {
    title: "Faculty Directory",
    faculty,
    sort,
  });
};

// Detail page
const facultyDetailPage = async (req, res, next) => {
  const facultySlug = req.params.slugId;

  const member = await getFacultyBySlug(facultySlug);

  if (Object.keys(member).length === 0) {
    const err = new Error(`Faculty ${facultySlug} not found`);
    err.status = 404;
    return next(err);
  }

  res.render("faculty/detail", {
    title: member.name,
    faculty: member,
  });
};

export { facultyListPage, facultyDetailPage };
