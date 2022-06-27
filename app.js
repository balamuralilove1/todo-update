const express = require("express");
const app = express();
app.use(express.json());
const format = require("date-fns/format");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const isValid = require("date-fns/isValid");

const startingDatabase = async () => {
  try {
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`database has stopped due ${e.message}`);
    process.exit(1);
  }
};
startingDatabase();
//
const convertDueDate = (table) => {
  return {
    id: table.id,
    todo: table.todo,
    priority: table.priority,
    status: table.status,
    category: table.category,
    dueDate: table.due_date,
  };
};

const priorityAndStatusAndCategory = (query) => {
  return (
    query.priority !== undefined &&
    query.status !== undefined &&
    query.category !== undefined
  );
};

const priorityAndCategory = (query) => {
  return query.priority !== undefined && query.category !== undefined;
};

const priorityAndStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

const statusAndCategory = (query) => {
  return query.status !== undefined && query.category !== undefined;
};

const priorityMethod = (query) => {
  return query.priority !== undefined;
};

const statusMethod = (query) => {
  return query.status !== undefined;
};

const categoryMethod = (query) => {
  return query.category !== undefined;
};

const dueQuery = (query) => {
  return query.due_date !== undefined;
};

///API 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority, category } = request.query;
  const queryObject = request.query;
  let condition = true;
  let message = "";
  let todoQuery = `
  SELECT 
  * 
  FROM 
  todo 
  WHERE 
  todo LIKE '%${search_q}%';
  `;
  if (priorityAndStatusAndCategory(queryObject)) {
    todoQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}' AND category = '${category}';
    `;
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    } else {
      condition = false;
      message = "Invalid Todo Priority";
    }
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    } else {
      condition = false;
      message = "Invalid Todo Status";
    }
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    } else {
      condition = false;
      message = "Invalid Todo Category";
    }
  } else if (priorityAndCategory(queryObject)) {
    todoQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      todo LIKE '%${search_q}%' AND priority = '${priority}' AND category = '${category}';
      `;
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    } else {
      condition = false;
      message = "Invalid Todo Priority";
    }
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    } else {
      condition = false;
      message = "Invalid Todo Category";
    }
  } else if (priorityAndStatus(queryObject)) {
    todoQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}';
      `;
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    } else {
      condition = false;
      message = "Invalid Todo Priority";
    }
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    } else {
      condition = false;
      message = "Invalid Todo Status";
    }
  } else if (statusAndCategory(queryObject)) {
    todoQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      todo LIKE '%${search_q}%' AND category = '${category}' AND status = '${status}';
      `;
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    } else {
      condition = false;
      message = "Invalid Todo Status";
    }
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    } else {
      condition = false;
      message = "Invalid Todo Category";
    }
  } else if (priorityMethod(queryObject)) {
    todoQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%' AND priority = '${priority}';
    `;
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    } else {
      condition = false;
      message = "Invalid Todo Priority";
    }
  } else if (statusMethod(queryObject)) {
    todoQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%' AND status = '${status}';
    `;
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    } else {
      condition = false;
      message = "Invalid Todo Status";
    }
  } else if (categoryMethod(queryObject)) {
    todoQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%' AND category = '${category}';
    `;
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    } else {
      condition = false;
      message = "Invalid Todo Category";
    }
  }
  const result = await db.all(todoQuery);
  if (condition) {
    response.status(200);
    response.send(result.map((each) => convertDueDate(each)));
  } else {
    response.status(400);
    response.send(`${message}`);
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query = `
  SELECT 
  *
  FROM 
  todo 
  WHERE 
  id = ${todoId};
  `;
  const result = await db.get(query);
  response.send(convertDueDate(result));
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (isValid(new Date(date))) {
    let dateObject = format(new Date(date), "yyyy-MM-dd");

    const query = `
  SELECT 
  * 
  FROM
  todo 
  WHERE 
  due_date = '${dateObject}'; 
  `;
    const result = await db.all(query);
    if (result.length > 0) {
      response.send(result.map((each) => convertDueDate(each)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

/// API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  let cond = null;
  if (dueDate !== undefined) {
    cond = isValid(new Date(dueDate));
  }
  if (cond) {
    const dateObject = format(new Date(dueDate), "yyyy-MM-dd");
    let condition = true;
    let message = null;
    const addQuery = `
  INSERT INTO 
  todo (id , todo , category , priority , status , due_date)
  VALUES (
      ${id},
      '${todo}',
      '${category}',
      '${priority}',
      '${status}',
      '${dateObject}'
  );`;
    await db.run(addQuery);
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    } else {
      condition = false;
      message = "Invalid Todo Priority";
    }
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    } else {
      condition = false;
      message = "Invalid Todo Status";
    }
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    } else {
      condition = false;
      message = "Invalid Todo Category";
    }

    if (condition) {
      response.send("Todo Successfully Added");
    } else {
      response.status(400);
      response.send(`${message}`);
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

/// API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const body = request.body;
  const { dueDate } = request.body;
  let condition = true;
  if (dueDate !== undefined) {
    condition = isValid(new Date(dueDate));
  }
  if (condition) {
    const query = `
  SELECT 
  * 
  FROM 
  todo
  WHERE 
  id = ${todoId}; 
  `;
    const result = await db.get(query);
    const {
      id = result.id,
      todo = result.todo,
      category = result.category,
      priority = result.priority,
      status = result.status,
      dueDate = result.due_date,
    } = request.body;
    const finalDate = format(new Date(dueDate), "yyyy-MM-dd");
    const addQuery = `
  UPDATE 
  todo 
  SET 
  id = ${id},
  todo = '${todo}',
  category = '${category}',
  priority = '${priority}',
  status = '${status}',
  due_date = '${finalDate}'
  WHERE 
  id = ${todoId};
  `;
    await db.run(addQuery);

    if (body.status !== undefined) {
      if (
        body.status === "TO DO" ||
        body.status === "IN PROGRESS" ||
        body.status === "DONE"
      ) {
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else if (body.priority !== undefined) {
      if (
        body.priority === "HIGH" ||
        body.priority === "LOW" ||
        body.priority === "MEDIUM"
      ) {
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else if (body.todo !== undefined) {
      response.send("Todo Updated");
    } else if (body.category !== undefined) {
      if (
        body.category === "WORK" ||
        body.category === "HOME" ||
        body.category === "LEARNING"
      ) {
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else if (body.dueDate !== undefined) {
      response.send("Due Date Updated");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

/// API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
  DELETE FROM 
  todo 
  WHERE 
  id = ${todoId};
  `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
