var express = require("express");
var app = express();
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );  
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});
var port = process.env.PORT || 2410;

app.listen(port,()=>console.log(`Listing on port ${port} !`));
const {customersData,coursesData,facultiesData,classesData,studentsData} = require("./data");

app.get("/test",function(req,res){
    res.send(customersData)
});

app.post("/login",function(req,res){
    let email=req.body.email;
    let password=req.body.password;
    console.log(email,password)
    let cust=customersData.find((cr)=>cr.email===email && cr.password===password);
    if (cust){
        let json={
            name:cust.name,
            email:cust.email,
            role:cust.role,
        }
        res.send(json);
    }
    else{
        res.status(500).send("Either Password or Email is incorrect");
    }
});
app.post("/register",function(req,res){
    let body=req.body;
    let maxId=customersData.reduce((acc,curr)=>curr.custId>=acc?curr.custId:acc,0);
    let newId=maxId+1;
    let newCustomer={custId:newId,...body};
    customersData.push(newCustomer);
    console.log(newCustomer);
    let json={
        name:body.name,
        role:body.role,
        email:body.email,
    }
    res.send(json);
});

app.get("/getStudentNames",function(req,res){
    let studentsList=studentsData.reduce((acc,curr)=>[...acc,curr.name],[]);
    res.send(studentsList);
});

app.get("/getFacultyNames",function(req,res){
    let facultiesList=facultiesData.reduce((acc,curr)=>[...acc,curr.name],[]);
    res.send(facultiesList);
});

app.get("/getCourses",function(req,res){
    res.send(coursesData);
});

app.get("/getCourse/:id",function(req,res){
    let id = +req.params.id;
    let course=coursesData.find(cr=>cr.courseId===id);
    res.send(course);
});

app.put("/putCourse",function(req,res){
    let body = req.body;
    let index = coursesData.findIndex(cr=>cr.courseId===body.courseId);
    coursesData[index]=body;
    //console.log(body);
    for (let i=0;i<body.students.length;i++){
        let index=studentsData.findIndex(st=>st.name===body.students[i]);
        let id=studentsData[index].courses.findIndex(cr=>cr===body.name);
        if (id < 0){
            studentsData[index].courses.push(body.name);
        }
    }
    for (let i=0;i<body.faculty.length;i++){
        let index=facultiesData.findIndex(fl=>fl.name===body.faculty[i]);
        let id=facultiesData[index].courses.findIndex(cr=>cr===body.name);
        if (id<0){
            facultiesData[index].courses.push(body.name)
        }
    }
    res.send(coursesData[index])
});

app.get("/getStudents", function(req, res) {
    let page = +req.query.page || 1;
    let courses = req.query.course ? req.query.course.split(",") : null;
    let pageSize = 3; 
    let filteredStudents = studentsData;

    //console.log(courses)
    if (courses) {
        filteredStudents = studentsData.filter(student =>
            student.courses.some(course => courses.find(cr=>cr===course))
        );
    }
    //console.log(filteredStudents)
    let totalItems = filteredStudents.length;
    let totalPages = Math.ceil(totalItems / pageSize);
    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    let studentsOnPage = filteredStudents.slice(startIndex, endIndex);

    let response = {
        page: page,
        items: studentsOnPage,
        totalItems: studentsOnPage.length,
        totalNum: totalItems
    };

    res.send(response);
});

app.get("/getFaculties",function(req,res){
    let page = +req.query.page || 1;
    let courses = req.query.course ? req.query.course.split(",") : null;
    let pageSize = 3; 
    let filteredStudents = facultiesData;
    //console.log(courses)
    if (courses) {
        filteredStudents = facultiesData.filter(student =>
            student.courses.some(course => courses.find(cr=>cr===course))
        );
    }
    //console.log(filteredStudents)
    let totalItems = filteredStudents.length;
    let totalPages = Math.ceil(totalItems / pageSize);
    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    let studentsOnPage = filteredStudents.slice(startIndex, endIndex);

    let response = {
        page: page,
        items: studentsOnPage,
        totalItems: studentsOnPage.length,
        totalNum: totalItems
    };

    res.send(response);
});

app.post("/postStudentDetails",function(req,res){
    let body=req.body;
    let makId=studentsData.reduce((acc,curr)=>curr.id>=acc?curr.id:acc,0);
    let newId=makId+1;
    let newStudent={id:newId,
        name:body.name,
        dob:body.dob,
        gender:body.gender,
        about:body.about,
        courses:[]
    }
    studentsData.unshift(newStudent);
    res.send(newStudent);
});

app.get("/getStudentDetails/:name",function(req,res){
    let name=req.params.name;
    let index=studentsData.findIndex(st=>st.name===name);
    if (index>=0){
        let student=studentsData.find(st=>st.name===name);
        //console.log(student,name);
        let json={
            id:student.id,
            name:student.name,
            dob:student.dob,
            gender:student.gender,
            about:student.about,
        }
        res.send(json);
    }
    else{
        res.status(500).send("No such Student");
    }
});

app.get("/getStudentCourse/:name",function(req,res){
    let name=req.params.name;
    //console.log(name);
    let index=studentsData.findIndex(st=>st.name===name);
    if (index>=0){
        let arr=coursesData.filter(cr=>cr.students.find(st=>st===name))
        arr=arr.reduce((acc,curr)=>[...acc,curr.name],[])
        
        let student=studentsData.find(st=>st.name===name);
        student.courses=arr;
        //console.log(student.courses);
        let json=[];
        for(let i=0;i<student.courses.length;i++){
            let course=coursesData.find(cr=>cr.name===student.courses[i]);
            let cour={
                courseId:course.courseId,
                name:course.name,
                code:course.code,
                description:course.description,
            }
            json.push(cour);
        }
        res.send(json);
    }
    else{
        res.status(500).send("No such Student");
    }
});

app.get("/getStudentClass/:name", function(req, res) {
    let name = req.params.name;
    let index = studentsData.findIndex(st => st.name === name);
    
    if (index >= 0) {
        let student = studentsData[index]; // Instead of finding the student again
        let json = [];

        for (let i = 0; i < student.courses.length; i++) {
            let course = student.courses[i];
            let classess = classesData.filter(cl => cl.course === course);

            if (classess.length > 0) { // Check if there are classes for the course
                for(let i=0;i<classess.length;i++){
                    json.push(classess[i]);
                }
            }
        }
        console.log(json);
        res.send(json);
    } else {
        res.status(500).send("No such Student");
    }
});


app.get("/getFacultyCourse/:name",function(req,res){
    let name=req.params.name;
    //console.log("Inside fac")
    let index=facultiesData.findIndex(fl=>fl.name===name);
    //console.log(index)
    if(index>=0){
        let faculty=facultiesData.find(fl=>fl.name===name);
        //console.log(faculty)
        let json=[];
        for (let i=0;i<faculty.courses.length;i++){
            let course=coursesData.find(cl=>cl.name===faculty.courses[i]);
            //console.log(course)
            let arr={
                courseId:course.courseId,
                name:course.name,
                code:course.code,
                description:course.description,
            }
            if (course) json.push(arr);
        }
        res.send(json);
    }
    else{
        res.status(500).send("No such Faculty");
    }
});

app.get("/getFacultyClass/:name",function(req,res){
    let name=req.params.name;
    let classes=classesData.filter(cl=>cl.facultyName===name);
    if (classes) {
        res.send(classes);
    }
    else{
        res.status(500).send("No class")
    }
});

app.post("/postClass",function(req,res){
    //console.log("post")
    let body=req.body;
    //console.log(body);
    let maxId=classesData.reduce((acc,curr)=>(curr.classId>=acc?curr.classId:acc),0);
    let newId = maxId+1;
    let newClass={classId:newId,...body};
    classesData.push(newClass);
    res.send(newClass);
});

app.put("/postClass/:classId",function(req,res){
    let classId=+req.params.classId;
    let body=req.body;
    let index=classesData.findIndex(cl=>cl.classId===classId);
    if (index>=0){
        let updatedClass={classId:classId,...body}
        classesData[index]=updatedClass;
        res.send(updatedClass);
    }
    else{
        res.status(500).send("No such class with this classId")
    }
})
