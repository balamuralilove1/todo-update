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
    response.send(result);
  } else {
    response.status(400);
    response.send(`${message}`);
  }
});
