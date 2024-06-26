// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask, putTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';
initializeData ();
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  createNewTaskBtn: document.getElementById('create-task-btn')
  
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}


// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    // addEventListener was missing 
    boardElement.addEventListener('click', () => { // Add click event listener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement); // Append inside the loop
  });
}




// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
// used strict equal instead of normal equal to filter tasks by board
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);
  //  added strict equals to compare instead of assign tasks.status with status
    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      // added an eventlistener 
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
//styleActiveBoard had syntax problem and classList had to be added in the if statement conditionals and forEach
// was written incorrectly
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach((btn) => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  // changed the single quotes ( ' ) to backticks ( ` )
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  // added taskElement to the appendChild argument
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  // added an eventListener
  cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',  () => { toggleSidebar(false); }) ; 
  elements.showSideBarBtn.addEventListener('click',  () => { toggleSidebar(true); }) ; 

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });

  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/
// collects user 
function addTask(event) {
  // stops the form from reloading the page
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
        id: Date.now().toString(), // Example ID
        title: document.getElementById('task-title-input').value,
        description: document.getElementById('task-desc-input').value,
        status: 'TODO', // Default status
        board: activeBoard // Associate with active board
      
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


/**
 * Toggles the visibility of the sidebar.
 * 
 * @param {boolean} show - Determines whether to show or hide the sidebar.
 */
function toggleSidebar(show) {
  // Get the sidebar element from the DOM using its ID
  const sidebar = document.getElementById('side-bar-div');

  // Check if the sidebar element was found
  if (!sidebar) {
    // If the sidebar element was not found, log an error message to the console
    console.error('Sidebar element not found');

    // Exit the function early to prevent further execution
    return;
  }

  // Toggle the display property of the sidebar element based on the show parameter
  if (show) {
    sidebar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
  } else {
    sidebar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
  }
}

function toggleTheme() {
      // Toggle the light-theme class on the body element
      document.body.classList.toggle('light-theme');

      // Check if the light-theme class is now present on the body
      const isLightTheme = document.body.classList.contains('light-theme');  
      
      // Save the current theme in local storage
      if (isLightTheme) {
        localStorage.setItem('light-theme', 'enabled');
      } else {
        localStorage.setItem('light-theme', 'disabled');
      }

  
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  
  // Get button elements from the task modal
  const saveButton = document.getElementById('save-task-changes-btn');
  const deleteButton = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  if (!saveButton || !deleteButton) {
    console.error('Save or delete button not found');
    return;
  }
    //   saveButton.onclick = function() {
    //     saveTaskChanges(task.id);
    // };

    saveButton.addEventListener('click', () => {
      saveTaskChanges(task.id);
    });

  // Delete task using a helper function and close the task modal
  deleteButton.onclick = function() {
    // call helper function to delete task
    deleteTask(task.id);
    closeModal();
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTaskName = document.getElementById('edit-task-title-input').value;
  const updatedTaskDescription = document.getElementById('edit-task-desc-input').value;
  const updatedTaskStatus = document.getElementById('edit-select-status').value;
  
  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    name: updatedTaskName,
    description: updatedTaskDescription,
    status: updatedTaskStatus
};
console.log(updatedTask);
  // Update task using a hlper functoin
  patchTask(updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  // closeModal();
  toggleModal(false, elements.editTaskModal);


  
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}


