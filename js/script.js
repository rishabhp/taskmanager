//(function () {

  var Helpers = {
    // http://stackoverflow.com/a/6860916/2272910
    guid: function () {
      var S4 = function() {
         return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    adjustPopupPosition: function ($el) {
      var width = $el.width()
        , height = $el.height();

      $el.css('margin-left', 0-width/2);
      $el.css('margin-top', 0-height/2);
    }
  };

  var Views = {
    full_shadow: $('#full_shadow'),

    // Boards
    boards: $('#boards'),
    new_boards_form: $('#new_boards_form'),
    edit_board_form: $('#edit_board_form'),
    board_list: $('#board_list'),
    board_count: $('#board_count'),
    board_edit_popup: $('#board_edit_popup'),

    // Tasks in board pages
    task_lists: $('#task_lists'),
    add_task_btn: $('.add_task_btn'),
    task_list_group: $('#task_list_group'),
    delete_board_btn: $('#delete_board_btn'),
    delete_task_list_btn: $('#delete_task_list_btn'),
    delete_task_btn: $('#delete_task_btn'),
    new_task_list_form: $('#new_task_list_form'),
    edit_task_list_form: $('#edit_task_list_form'),
    edit_task_form: $('#edit_task_form'),
    task_list_edit_popup: $('#task_list_edit_popup'),
    task_edit_popup: $('#task_edit_popup'),

    // Page not found
    page_not_found: $('#page_not_found'),

    // Header home
    home_btn: $('#home_btn'),

    // Templates
    task_list_panel_tpl: $('#task_list_panel_tpl'),
  };

  //
  // Generics
  //

  Views.home_btn.on('click', function () {
    var $el = $(this);

    location.hash = '';
    // reload for sure shot back to home
    location.reload();
  });

  Views.full_shadow.on('click', function () {
    var $el = $(this);

    $el.hide();
    $('.popup').hide();

    return false;
  });

 
  //
  // Boards
  //

  // Can also use a Constructor (and prototypal inheritance)
  // This is sort of like a Class encapsulation
  var Board = {
    create: function (board) {
      var board_name = board.board_name;
      var board_id = Helpers.guid();

      // New board object with:
      // - ID (that we might use later for some purpsoe)
      // - Board Name
      var new_board = { id: board_id, board_name: board_name };

      // Get all the boards
      var boards = this.getAll();
      // Push the new board to the queue
      boards.push(new_board);
      // Save the new boards list
      this.save(boards);

      return new_board;
    },

    update: function (new_board) {
      var boards = Board.getAll()
        , board;

      // TODO: Can be optimized instead of looping over all
      // the elements
      for (var i = 0; i < boards.length; i++) {
        board = boards[i];

        if (board.id === new_board.board_id) {
          // Set the new data
          boards[i].board_name = new_board.board_name;

          break;
        }
      }

      this.save(boards);
    },

    getAll: function () {
      // Get all the Board Names
      var boards = localStorage.getItem('boards') || "[]";
      boards = JSON.parse(boards);

      return boards;
    },

    save: function (boards) {
      var boards_json = JSON.stringify(boards);
      localStorage.setItem('boards', boards_json);
    },

    get: function (board_id) {
      var boards = this.getAll()
        , board;

      // TODO: Looping through all the boards
      // can be improved by storing a HashMap of
      // all the IDs in the DB or just another array
      // holding the IDs in the same order as boards
      // that can be searched using indexOf()
      for (var i = 0; i < boards.length; i++) {
        board = boards[i];

        if (board.id === board_id) {
          return board;
        }
      }
    },

    delete: function (board_id) {
      var boards = this.getAll()
        , board;

      // TODO: searching can be made faster
      // see the comment in get()
      for (var i = 0; i < boards.length; i++) {
        board = boards[i];

        if (board.id === board_id) {
          // Delete the board
          boards.splice(i, 1);
          
          break;
        }
      }

      this.save(boards);
    }
  };

  var BoardView = {
    // Create a new board when form submits
    new_board: function (el) {
      var $el = $(el)
        , board_name_field = $el.find('input[name="board_name"]')
        , board_name = board_name_field.val().trim()
        , new_board;

      if (!board_name) {
        // alert("Please enter a board name!");
      }
      else {
        // Create the board
        new_board = Board.create({ board_name: board_name });

        // Add the new board in the list
        this.add_board_to_list(new_board);
      }

      // Reset the name field
      board_name_field.val('');

      // Move to the board page
      location.hash = 'board/' + new_board.id;
    },

    update_board: function (el) {
      var $el = $(el)
        , board_name_field = $el.find('input[name="board_name"]')
        , board_name = board_name_field.val().trim()
        , board_id = $el.find('input[name="board_id"]').val()
        , board;

      Board.update({ board_id: board_id, board_name: board_name });
    },

    // List all the boards (generally during page load)
    list_boards: function() {
      var boards = Board.getAll()
        , board
        , self = this;

      // Set the board count
      self.set_board_count(boards.length);

      // Empty the list in the UI first
      Views.board_list.find('li').remove();

      boards.forEach(function (v, i, arr) {
        board = v;

        self.add_board_to_list(board);
      });
    },

    // Adding a single board item to the list
    add_board_to_list: function(board) {
      // Create a list item
      var $li = $('<li><a href="#"></a></li>');
      $li.find('a').text(board.board_name);
      $li.find('a').attr('href', '#board/'+board.id);
      $li.append('<a class="edit_board" href="javascript:void(0);" title="Edit Board" data-board_id="'+board.id+'"><i class="fa fa-edit"></i></a>');
      Views.board_list.append($li);
    },

    set_board_count: function (count) {
      Views.board_count.text(count);
    },

    openEditPopup: function () {
      Helpers.adjustPopupPosition(Views.board_edit_popup);

      Views.full_shadow.show();
      Views.board_edit_popup.show();
    },

    closeEditPopup: function () {
      Views.full_shadow.hide();
      Views.board_edit_popup.hide();
    }
  };

  // Attaching Events

  // On new board form submit
  Views.new_boards_form.on('submit', function () {
    BoardView.new_board(this);

    return false;
  });

  // Edit Board
  Views.board_list.on('click', '.edit_board', function () {
    BoardView.openEditPopup();
    var $el = $(this);
    var board_id = $el.data('board_id');

    var board = Board.get(board_id);

    // Set the board name
    Views.board_edit_popup.find('input[name="board_name"]').val(board.board_name);
    // Set the board ID
    Views.board_edit_popup.find('input[name="board_id"]').val(board.id);
  });

  Views.edit_board_form.on('submit', function() {
    // Update the board
    BoardView.update_board(this);

    // Close the popup first
    BoardView.closeEditPopup();

    // Reprint to reflect changes
    // TODO: Not efficient to print entire list again
    // should only invalidate the relevant entry
    BoardView.list_boards();

    return false;
  });


  // Task Lists

  var TaskList = {

    board_id: null,

    create: function (task_list) {
      var task_list_name = task_list.task_list_name;
      var task_list_id = Helpers.guid();
      var board_id = this.board_id;

      // New board object with:
      // - ID (that we might use later for some purpsoe)
      // - Task List Name
      // - Board ID
      var new_task_list = { id: task_list_id, task_list_name: task_list_name, board_id: board_id };

      // Get all the task lists
      var task_lists = this.getAll();
      // Push the new task list to the queue
      task_lists.push(new_task_list);
      // Save the new task list
      this.save(task_lists);

      return new_task_list;
    },

    update: function (new_task_list) {
      // Get all task lists
      var task_lists = TaskList.getAll()
        , task_list;

      // TODO: Can be optimized instead of looping over all
      // the elements (even those not belonging to this board)
      for (var i = 0; i < task_lists.length; i++) {
        task_list = task_lists[i];

        // Find the matching task list by ID
        if (task_list.id === new_task_list.task_list_id) {
          // Set the new data
          task_lists[i].task_list_name = new_task_list.task_list_name;

          break;
        }
      }

      this.save(task_lists);
    },

    getAll: function (board_id) {
      // Get all the Task Lists
      var task_lists = localStorage.getItem('task_lists') || "[]";
      task_lists = JSON.parse(task_lists);

      if (typeof board_id !== 'undefined') {
        var task_list;
        var tmp_task_lists = [];

        task_lists.forEach(function (v, i, arr) {
          task_list = v;

          if (task_list.board_id === board_id) {
            tmp_task_lists.push(task_list);
          }
        });

        task_lists = tmp_task_lists;
      }

      return task_lists;
    },

    save: function (task_lists) {
      var task_lists_json = JSON.stringify(task_lists);
      localStorage.setItem('task_lists', task_lists_json);
    },

    get: function (task_list_id) {
      var task_lists = this.getAll()
        , task_list;

      // TODO: Check the comments in Board constructor
      for (var i = 0; i < task_lists.length; i++) {
        task_list = task_lists[i];

        if (task_list.id === task_list_id) {
          return task_list;
        }
      }
    },

    delete: function (task_list_id) {
      var task_lists = this.getAll()
        , task_list;

      // TODO: searching can be made faster
      // see the comment in get()
      for (var i = 0; i < task_lists.length; i++) {
        task_list = task_lists[i];

        if (task_list.id === task_list_id) {
          // Delete the board
          task_lists.splice(i, 1);
          
          break;
        }
      }

      this.save(task_lists);
    }
  };

  var TaskListView = {
    // Create a new board when form submits
    new_task_list: function (el) {

      var $el = $(el)
        , task_list_name_field = $el.find('input[name="task_list_name"]')
        , task_list_name = task_list_name_field.val().trim()
        , new_task_list;

      if (!task_list_name) {
        // alert("Please enter a task list name!");
      }
      else {

        // Create the task list
        new_task_list = TaskList.create({ task_list_name: task_list_name });

        // Add the new board in the list
        this.add_task_list_to_list(new_task_list);
      }

      // Reset name field
      task_list_name_field.val('');
    },

    // Update logic for the task list form update call
    update_task_list: function(el) {
      var $el = $(el)
        , task_list_name_field = $el.find('input[name="task_list_name"]')
        , task_list_name = task_list_name_field.val().trim()
        , task_list_id = $el.find('input[name="task_list_id"]').val()
        , board_id = TaskList.board_id
        , task_list;

      // DB Model call
      TaskList.update({ task_list_id: task_list_id, task_list_name: task_list_name, board_id: board_id });
    },

    // Add each task list box/panel
    add_task_list_to_list: function (task_list) {
      var tpl = $(Views.task_list_panel_tpl.html());
      
      // Set the task list name
      tpl.find('.task_list_name .head_text').text(task_list.task_list_name);
      // Set task list ID in the form to save with task
      tpl.find('input[name="task_list_id"]').val(task_list.id);
      // Set the data on edit btn
      tpl.find('.edit_task_list').attr('data-task_list_id', task_list.id);
      
      Views.task_list_group.append(tpl);

      this.adjust_task_panel_width();
    },

    show_add_task_form: function (el) {
      var $el = $(el)
        , add_task_form;

      $el.hide();
      add_task_form = $el.closest('.add_task_section').find('.add_task_form');
      add_task_form.show();
    },

    adjust_task_panel_width: function () {
      // Adjust Views.task_list_group width
      var width =
                  Views.task_list_group.find('.task_list_panel:eq(0)').width() *
                  Views.task_list_group.find('.task_list_panel').length;

      // Add margins
      width +=
              parseInt(Views.task_list_group.find('.task_list_panel:eq(0)').css('margin-right')) *
              Views.task_list_group.find('.task_list_panel').length;

      width += 100; // safety

      Views.task_list_group.width(width);
    },

    list_task_lists: function () {
      var task_lists = TaskList.getAll(TaskList.board_id)
        , task_list
        , self = this
        , tasks = []
        , task;

      // Clear all the panels first
      Views.task_list_group.find('.task_list_panel').remove();

      task_lists.forEach(function (v, i, arr) {
        task_list = v;

        self.add_task_list_to_list(task_list);
      });

      // Now go about adding tasks in each task list
      task_lists.forEach(function (v, i, arr) {
        task_list = v;

        // Get all the tasks for this task list
        tasks = Task.getByTaskListId(task_list.id);
        
        if (tasks == null) return;

        tasks.forEach(function (v, i, arr) {
          task = v;

          // Add task to task list
          TaskView.add_task_to_list(task, task_list.id);
        });
        
      });
    },

    openEditPopup: function () {
      Helpers.adjustPopupPosition(Views.task_list_edit_popup);

      Views.full_shadow.show();
      Views.task_list_edit_popup.show();
    },

    closeEditPopup: function () {
      Views.full_shadow.hide();
      Views.task_list_edit_popup.hide();
    }
  };

  // Attaching Events

  // On new task lists form submit
  Views.new_task_list_form.on('submit', function () {
    TaskListView.new_task_list(this);

    return false;
  });

  // Add Task Button
  Views.task_list_group.on('click', '.add_task_btn', function () {
    TaskListView.show_add_task_form(this);

    return false;
  });

  // Edit Task List
  Views.task_list_group.on('click', '.edit_task_list', function () {
    TaskListView.openEditPopup();

    var $el = $(this);
    var task_list_id = $el.data('task_list_id');

    var task_list = TaskList.get(task_list_id);

    // Set the task list name
    Views.task_list_edit_popup.find('input[name="task_list_name"]').val(task_list.task_list_name);
    // Set the task list ID
    Views.task_list_edit_popup.find('input[name="task_list_id"]').val(task_list.id);
    // Set the task list ID for deletion too
    Views.delete_task_list_btn.attr('data-task_list_id', task_list.id);
  });

  // Edit task list form
  Views.edit_task_list_form.on('submit', function() {
    // Update the task list
    TaskListView.update_task_list(this);

    // Close the popup first
    TaskListView.closeEditPopup();

    // Reprint to reflect changes
    // TODO: Not efficient to print entire list again
    // should only invalidate the relevant entry
    // especially since this also reprints the tasks
    TaskListView.list_task_lists();

    return false;
  });

  // Delete board
  Views.delete_board_btn.on('click', function () {
    var confirm_msg = confirm("Are you sure?");

    if (confirm_msg) {
      Board.delete(TaskList.board_id);

      // Redirect to home
      location.hash = '';
    }

    return false;
  });

  // Delete task list
  Views.delete_task_list_btn.on('click', function () {
    var $el = $(this)
      , task_list_id;

    var confirm_msg = confirm("Are you sure?");

    if (confirm_msg) {
      task_list_id = $el.data('task_list_id');
      TaskList.delete(task_list_id);

      // yay!!!
      TaskListView.list_task_lists();
      TaskListView.closeEditPopup();
    }

    return false;
  });


  // Tasks

  var Task = {

    create: function (task) {
      var task_content = task.task_content;
      var task_list_id = task.task_list_id;
      var task_id = Helpers.guid();
      var board_id = TaskList.board_id;

      // New task object with:
      // - ID (that we might use later for some purpsoe)
      // - Task Content
      // - Board ID
      var new_task = { id: task_id, task_content: task_content, board_id: board_id };
      
      // Get all the tasks
      var tasks = this.getAll();
      // Push the new task to the queue
      if (typeof tasks[task_list_id] === 'undefined') {
        tasks[task_list_id] = [];
      }
      tasks[task_list_id].push(new_task);
      // Save the new tasks list
      this.save(tasks);

      return new_task;
    },

    update: function (new_task) {
      // Get all task lists
      var tasks = Task.getAll()
        , task;

      for (var i = 0; i < tasks[new_task.task_list_id].length; i++) {
        task = tasks[new_task.task_list_id][i];

        // Find the matching task by ID
        if (task.id === new_task.task_id) {
          // Set the new content
          tasks[new_task.task_list_id][i].task_content = new_task.task_content;

          break;
        }
      }

      this.save(tasks);
    },

    getAll: function () {
      // Get all the Tasks
      var tasks = localStorage.getItem('tasks') || "{}";
      tasks = JSON.parse(tasks);

      return tasks;
    },

    // Get tasks of a particular task list
    getByTaskListId: function (task_list_id) {
      // Get all the Tasks
      var tasks = localStorage.getItem('tasks') || "{}";
      tasks = JSON.parse(tasks);

      if (typeof tasks[task_list_id] !== 'undefined') {
        return tasks[task_list_id];
      }

      return null;
    },

    get: function (task_id, task_list_id) {
      // Get all tasks by Task List ID
      var tasks = this.getByTaskListId(task_list_id)
        , task;

      for (var i = 0; i < tasks.length; i++) {
        task = tasks[i];

        if (task.id === task_id) {
          return task;
        }
      }
    },

    save: function (tasks) {
      var tasks_json = JSON.stringify(tasks);
      localStorage.setItem('tasks', tasks_json);
    },

    delete: function (task_id, task_list_id) {
      var tasks = this.getAll()
        , task;

      // TODO: searching can be made faster
      // see the comment in get()
      for (var i = 0; i < tasks[task_list_id].length; i++) {
        task = tasks[task_list_id][i];

        if (task.id === task_id) {
          // Delete the board
          tasks[task_list_id].splice(i, 1);
          
          break;
        }
      }

      this.save(tasks);
    }
  };

  var TaskView = {
    new_task: function (el) {
      var $el = $(el)
        , task_content_field = $el.find('input[name="task_content"]')
        , task_content = task_content_field.val().trim()
        , task_list_id = $el.find('input[name="task_list_id"]').val()
        , new_task;

      if (!task_content) {
        // alert("Please enter a some task content!");
      }
      else {

        // Create the task list
        new_task = Task.create({ task_content: task_content, task_list_id: task_list_id });
        
        // Add the new board in the list
        this.add_task_to_list(new_task, task_list_id);
      }

      // Empty the task content
      task_content_field.val('');
    },

    update_task: function(el) {
      var $el = $(el)
        , task_content_field = $el.find('input[name="task_content"]')
        , task_content = task_content_field.val().trim()
        , task_list_id = $el.find('input[name="task_list_id"]').val()
        , task_id = $el.find('input[name="task_id"]').val()
        , board_id = TaskList.board_id
        , task;

      // DB Model call
      Task.update({ task_id: task_id, task_content: task_content, task_list_id: task_list_id });
    },

    // Add task views to the list/html
    add_task_to_list: function (task, task_list_id) {
      var task_list_panel = $('input[value="'+task_list_id+'"]').closest('.task_list_panel');
      var tasks_list = task_list_panel.find('ul');

      var li = $('<li />');
      li.text(task.task_content); // will do auto html escaping
      li.append('<a class="edit_task" data-task_id="'+task.id+'" data-task_list_id="'+task_list_id+'" href="javascript:void(0);"><i class="fa fa-pencil"></i></a>');
      tasks_list.append(li);
    },

    openEditPopup: function () {
      Helpers.adjustPopupPosition(Views.task_edit_popup);

      Views.full_shadow.show();
      Views.task_edit_popup.show();
    },

    closeEditPopup: function () {
      Views.full_shadow.hide();
      Views.task_edit_popup.hide();
    }
  };

  // Attaching Events

  // Add tasks
  Views.task_list_group.on('submit', '.add_task_form', function () {
    TaskView.new_task(this);

    return false;
  });

  // Edit Task List
  Views.task_list_group.on('click', '.edit_task', function () {
    TaskView.openEditPopup();

    var $el = $(this);
    var task_id = $el.data('task_id');
    var task_list_id = $el.data('task_list_id');

    var task = Task.get(task_id, task_list_id);
    
    // Set the task content
    Views.task_edit_popup.find('input[name="task_content"]').val(task.task_content);
    // Set the task ID
    Views.task_edit_popup.find('input[name="task_id"]').val(task.id);
    // Set the task list ID (as that is used as a KEY in the data store)
    Views.task_edit_popup.find('input[name="task_list_id"]').val(task_list_id);
    // Set the task ID and task list ID for delete button too
    Views.delete_task_btn.attr('data-task_list_id', task_list_id);
    Views.delete_task_btn.attr('data-task_id', task.id);
  });

  // Edit task list form
  Views.edit_task_form.on('submit', function() {
    // Update the task list
    TaskView.update_task(this);

    // Close the popup first
    TaskView.closeEditPopup();

    // Reprint to reflect changes
    // TODO: Not efficient to print entire list again
    // should only invalidate the relevant entry
    // especially since this also reprints the tasks
    //
    // This prints all the task lists whereas
    // we should only refresh the tasks in the
    // corresponding task list, infact we should update
    // only one task entry
    TaskListView.list_task_lists();

    return false;
  });

  // Delete task using task ID and task list ID
  Views.delete_task_btn.on('click', function () {
    var $el = $(this)
      , task_list_id
      , task_id;

    var confirm_msg = confirm("Are you sure?");

    if (confirm_msg) {
      task_list_id = $el.data('task_list_id');
      task_id = $el.data('task_id');

      Task.delete(task_id, task_list_id);

      // yay!!!
      TaskListView.list_task_lists();
      TaskView.closeEditPopup();
    }

    return false;
  });


  //
  // Routing
  // Super basic hash based routing
  //

  var Router = {
    init: function () {
      var url_hash = location.hash.substring(1);

      if (url_hash) {
        // Check for Boards
        var re = new RegExp('board/.*', 'g');
        var match = location.hash.match(re);

        if (match !== null && typeof match[0] !== 'undefined') {
          var board_id = match[0].split('/')[1];

          this.showBoard(board_id);
        }
      }
      else {
        // Dashboard, home page
        this.showDash();
      }
    },

    showDash: function () {
      Views.boards.show();
      Views.task_lists.hide();
      Views.page_not_found.hide();

      // List all Boards
      BoardView.list_boards();
    },

    showBoard: function (board_id) {
      Views.boards.hide();
      Views.task_lists.show();
      Views.page_not_found.hide();

      var board = Board.get(board_id);

      // Invalid board ID
      if (typeof board === 'undefined') {
        Views.boards.hide();
        Views.task_lists.hide();
        Views.page_not_found.show();
        return;
      }

      TaskList.board_id = board_id;

      // Show the board heading
      Views.task_lists.find('h1 .head_text').text(board.board_name);

      // List all Task Lists and their Tasks
      TaskListView.list_task_lists();
    }
  };

  Router.init();

  $(window).on('hashchange', function () {
    Router.init();
  });

//}());