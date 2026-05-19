/**
 * app.js — Student Task Manager Frontend
 * Complete with all pages functionality
 * Base URL: http://localhost:8081/api/tasks
 */

// ─── Configuration ──────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8081/api/tasks';

// ─── On Page Load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Only load tasks if on index page
    if (document.getElementById('taskList')) {
        loadTasks();
    }
});

// ════════════════════════════════════════════════════════════════════════════
//  CORE API FUNCTIONS (Shared across all pages)
// ════════════════════════════════════════════════════════════════════════════

async function loadTasks() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to load tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Could not connect to server', 'error');
    }
}

async function createTask() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDescription');
    const title = titleInput?.value.trim();
    const description = descInput?.value.trim();

    if (!title) {
        showToast('Please enter a task title!', 'error');
        titleInput?.focus();
        return;
    }

    const newTask = { title, description, completed: false };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) throw new Error('Failed to create task');

        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';

        showToast('✓ Task added successfully!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Error creating task:', error);
        showToast('Failed to add task', 'error');
    }
}

async function toggleTask(id, currentTask) {
    const updatedTask = {
        title: currentTask.title,
        description: currentTask.description,
        completed: !currentTask.completed
    };

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) throw new Error('Failed to update task');

        const msg = updatedTask.completed ? '✓ Task completed!' : 'Task marked as pending';
        showToast(msg, 'success');
        await loadTasks();
    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Failed to update task', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        showToast('🗑 Task deleted', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    }
}

async function saveEdit() {
    const id = document.getElementById('editId')?.value;
    const title = document.getElementById('editTitle')?.value.trim();
    const description = document.getElementById('editDescription')?.value.trim();

    if (!title) {
        showToast('Title cannot be empty!', 'error');
        return;
    }

    try {
        const getResp = await fetch(`${API_BASE}/${id}`);
        const existing = await getResp.json();

        const updatedTask = { title, description, completed: existing.completed };

        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) throw new Error('Failed to update task');

        closeModal();
        showToast('✓ Task updated!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Error saving edit:', error);
        showToast('Failed to save changes', 'error');
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function renderTasks(tasks) {
    const listEl = document.getElementById('taskList');
    const emptyEl = document.getElementById('emptyState');
    const totalCount = document.getElementById('totalCount');
    const doneCount = document.getElementById('doneCount');

    if (!listEl) return;

    const doneTotal = tasks.filter(t => t.completed).length;
    if (totalCount) totalCount.textContent = `${tasks.length} total`;
    if (doneCount) doneCount.textContent = `${doneTotal} done`;
    if (emptyEl) emptyEl.style.display = tasks.length === 0 ? 'block' : 'none';
    
    listEl.innerHTML = '';

    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-number">${index + 1}</div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                ${task.completed ? '<span class="completed-badge">✔ Done</span>' : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-success btn-sm" onclick="toggleTask(${task.id}, ${JSON.stringify(task).replace(/"/g, '&quot;')})">
                    ${task.completed ? 'Undo' : '✓ Done'}
                </button>
                <button class="btn btn-secondary btn-sm" onclick='openEditModal(${task.id}, "${escapeForAttr(task.title)}", "${escapeForAttr(task.description || '')}")'>
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        `;
        listEl.appendChild(card);
    });
}

// ════════════════════════════════════════════════════════════════════════════
//  MODAL FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function openEditModal(id, title, description) {
    const editId = document.getElementById('editId');
    const editTitle = document.getElementById('editTitle');
    const editDescription = document.getElementById('editDescription');
    
    if (editId) editId.value = id;
    if (editTitle) editTitle.value = title;
    if (editDescription) editDescription.value = description;
    
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking overlay
const modalElement = document.getElementById('editModal');
if (modalElement) {
    modalElement.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Enter key support
const taskTitleInput = document.getElementById('taskTitle');
if (taskTitleInput) {
    taskTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createTask();
    });
}

// ════════════════════════════════════════════════════════════════════════════
//  ANALYTICS FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

async function loadAnalytics() {
    try {
        const response = await fetch(API_BASE);
        const tasks = await response.json();
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const pendingEl = document.getElementById('pendingTasks');
        const rateEl = document.getElementById('completionRate');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;
        if (rateEl) rateEl.textContent = rate + '%';
        
        if (progressBar) {
            progressBar.style.width = rate + '%';
            progressBar.textContent = rate + '%';
        }
        
        if (progressText) {
            progressText.textContent = `You've completed ${completed} out of ${total} tasks (${rate}%)`;
        }
        
        const insights = [];
        if (rate === 100) {
            insights.push('🎉 Perfect! All tasks completed! Great job!');
        } else if (rate >= 70) {
            insights.push('🌟 Excellent progress! Keep up the great work!');
        } else if (rate >= 40) {
            insights.push('📈 Good progress! You\'re on the right track.');
        } else if (rate > 0) {
            insights.push('💪 Keep going! Every completed task is a step forward.');
        } else {
            insights.push('🚀 Start by adding your first task!');
        }
        
        if (pending > 5) {
            insights.push('📝 You have ' + pending + ' pending tasks. Time to focus!');
        } else if (pending > 0) {
            insights.push('🎯 Just ' + pending + ' task(s) left! You\'re almost there!');
        }
        
        if (total === 0) {
            insights.push('✨ Create your first task using the form above!');
        }
        
        const insightsList = document.getElementById('insightsList');
        if (insightsList) {
            insightsList.innerHTML = insights.map(i => `<li><span style="font-size:20px; margin-right:10px;">💡</span> ${i}</li>`).join('');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Could not load analytics', 'error');
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  CALENDAR FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

let currentDate = new Date();
let allTasksForCalendar = [];

async function loadCalendar() {
    try {
        // Ensure categories are loaded for the calendar create modal
        if (typeof loadCategories === 'function') loadCategories();

        const response = await fetch(API_BASE);
        allTasksForCalendar = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Error loading calendar:', error);
        showToast('Could not load calendar', 'error');
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    if (monthYearDisplay) {
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    }
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDay - i;
        const dateObj = new Date(year, month - 1, dayNum);
        const dayDiv = createDayElement(dateObj, true);
        calendarDays.appendChild(dayDiv);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayDiv = createDayElement(dateObj, false);
        calendarDays.appendChild(dayDiv);
    }
    
    // Next month days
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const dateObj = new Date(year, month + 1, i);
        const dayDiv = createDayElement(dateObj, true);
        calendarDays.appendChild(dayDiv);
    }
}

function createDayElement(dateObj, isOtherMonth) {
    const dayNum = dateObj.getDate();
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (isOtherMonth) dayDiv.classList.add('other-month');

    dayDiv.innerHTML = `<div class="day-number">${dayNum}</div><div class="calendar-tasks"></div>`;

    const tasksContainer = dayDiv.querySelector('.calendar-tasks');
    // Find tasks whose dueDate matches this date
    const dayTasks = allTasksForCalendar.filter(task => {
        if (!task.dueDate) return false;
        const t = new Date(task.dueDate);
        return t.getFullYear() === dateObj.getFullYear() && t.getMonth() === dateObj.getMonth() && t.getDate() === dateObj.getDate();
    }).slice(0, 3);

    dayTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `calendar-task ${task.completed ? 'completed' : ''}`;
        taskEl.textContent = task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title;
        taskEl.title = task.title + (task.description ? '\n' + task.description : '');
        taskEl.onclick = (e) => {
            e.stopPropagation();
            showToast(task.title + ': ' + (task.completed ? 'Completed ✓' : 'Pending ○'), 'info');
        };
        tasksContainer.appendChild(taskEl);
    });

    if (dayTasks.length === 0 && !isOtherMonth) {
        tasksContainer.innerHTML = '<div style="font-size:10px; color:var(--text-muted); padding:4px;">No tasks</div>';
    }

    // Clicking the day opens a small modal to create a task for this date
    dayDiv.onclick = () => openCalendarCreateModal(dateObj);

    return dayDiv;
}

// Open create modal on calendar page with the selected date prefilled
function openCalendarCreateModal(dateObj) {
    const modal = document.getElementById('calendarCreateModal');
    if (!modal) return;

    const inputDate = document.getElementById('calendarTaskDueDate');
    const titleInput = document.getElementById('calendarTaskTitle');
    const descInput = document.getElementById('calendarTaskDescription');
    const categorySelect = document.getElementById('calendarTaskCategory');

    if (inputDate) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        inputDate.value = `${yyyy}-${mm}-${dd}T09:00`;
    }
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';

    if (categorySelect && typeof categories !== 'undefined') {
        categorySelect.innerHTML = '<option value="">-- Select a category --</option>';
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            categorySelect.appendChild(opt);
        });
    }

    modal.style.display = 'flex';
}

async function submitCalendarTask() {
    const title = document.getElementById('calendarTaskTitle')?.value.trim();
    const description = document.getElementById('calendarTaskDescription')?.value.trim();
    const dueDate = document.getElementById('calendarTaskDueDate')?.value || null;
    const categoryId = document.getElementById('calendarTaskCategory')?.value || null;

    if (!title) { showToast('Please provide a title', 'error'); return; }

    const payload = { title, description, completed: false, dueDate };
    if (categoryId) payload.category = { id: parseInt(categoryId) };

    try {
        const resp = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
        if (!resp.ok) throw new Error('Failed to create task');
        document.getElementById('calendarCreateModal').style.display = 'none';
        showToast('Task created for selected date', 'success');
        await loadCalendar();
        if (document.getElementById('taskList')) loadTasks();
    } catch (err) {
        console.error(err);
        showToast('Failed to create task', 'error');
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadCalendar();
}

// ════════════════════════════════════════════════════════════════════════════
//  CATEGORIES FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

let categories = [];
let selectedColor = '#f0a500';
let currentCategoryFilter = 'all';

function loadCategories() {
    const saved = localStorage.getItem('task_categories');
    if (saved) {
        categories = JSON.parse(saved);
    } else {
        categories = [
            { id: 1, name: 'School', color: '#2ea043', taskCount: 0 },
            { id: 2, name: 'Personal', color: '#f0a500', taskCount: 0 },
            { id: 3, name: 'Work', color: '#f85149', taskCount: 0 }
        ];
        saveCategories();
    }
    renderCategoryList();
}

function saveCategories() {
    localStorage.setItem('task_categories', JSON.stringify(categories));
}

function addCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput?.value.trim();
    
    if (!name) {
        showToast('Please enter a category name', 'error');
        return;
    }
    
    const newCategory = {
        id: Date.now(),
        name: name,
        color: selectedColor,
        taskCount: 0
    };
    
    categories.push(newCategory);
    saveCategories();
    renderCategoryList();
    
    if (nameInput) nameInput.value = '';
    showToast('Category added successfully!', 'success');
    
    // Refresh filter chips
    renderFilterChips();
}

function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    categories = categories.filter(c => c.id !== id);
    saveCategories();
    renderCategoryList();
    renderFilterChips();
    showToast('Category deleted', 'info');
}

function renderCategoryList() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 20px;"><p>No categories yet. Create one!</p></div>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-color-preview" style="background: ${cat.color};"></div>
                <div>
                    <div class="category-name">${escapeHtml(cat.name)}</div>
                    <div class="category-count">${cat.taskCount || 0} tasks</div>
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.id})">Delete</button>
        </div>
    `).join('');
    
    renderFilterChips();
}

function renderFilterChips() {
    const container = document.getElementById('filterButtons');
    if (!container) return;
    
    // Keep the "All Tasks" button
    container.innerHTML = '<div class="filter-chip active" data-category="all" onclick="filterByCategory(\'all\', this)">All Tasks</div>';
    
    categories.forEach(cat => {
        const chip = document.createElement('div');
        chip.className = 'filter-chip';
        chip.setAttribute('data-category', cat.id);
        chip.textContent = cat.name;
        chip.style.borderLeft = `3px solid ${cat.color}`;
        chip.onclick = () => filterByCategory(cat.id, chip);
        container.appendChild(chip);
    });
}

async function loadTasksWithCategories() {
    try {
        const response = await fetch(API_BASE);
        const tasks = await response.json();
        
        // Update category counts
        categories.forEach(cat => {
            // For demo, assign random counts based on pending tasks
            cat.taskCount = tasks.filter(t => !t.completed).length;
        });
        saveCategories();
        renderCategoryList();
        
        // Filter tasks based on selection
        let filteredTasks = tasks;
        if (currentCategoryFilter !== 'all') {
            // For demo, show pending tasks
            filteredTasks = tasks.filter(t => !t.completed).slice(0, 5);
        }
        
        renderCategoryTasks(filteredTasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Could not load tasks', 'error');
    }
}

function renderCategoryTasks(tasks) {
    const container = document.getElementById('categoryTasksList');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No tasks in this category</p><p style="font-size: 13px;">Add tasks from the Tasks page</p></div>';
        return;
    }
    
    container.innerHTML = tasks.map((task, idx) => `
        <div class="task-card ${task.completed ? 'completed' : ''}" style="margin-bottom: 12px;">
            <div class="task-number">${idx + 1}</div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                ${task.completed ? '<span class="completed-badge">✔ Done</span>' : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-success btn-sm" onclick="quickToggleTask(${task.id}, ${task.completed})">
                    ${task.completed ? 'Undo' : '✓ Done'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="quickDeleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function quickToggleTask(id, currentCompleted) {
    try {
        const getResp = await fetch(`${API_BASE}/${id}`);
        const task = await getResp.json();
        
        const updatedTask = {
            title: task.title,
            description: task.description,
            completed: !currentCompleted
        };
        
        await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });
        
        showToast(updatedTask.completed ? '✓ Task completed!' : 'Task undone', 'success');
        loadTasksWithCategories();
        // Also refresh main page if it exists
        if (document.getElementById('taskList')) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Failed to update task', 'error');
    }
}

async function quickDeleteTask(id) {
    if (!confirm('Delete this task?')) return;
    
    try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        showToast('Task deleted', 'success');
        loadTasksWithCategories();
        if (document.getElementById('taskList')) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    }
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
        const bgColor = opt.style.backgroundColor;
        const bgColorRgb = opt.style.background;
        
        if (bgColor === color || bgColorRgb === color) {
            opt.classList.add('selected');
        }
        // Handle hex to rgb conversion for comparison
        if (color === '#f0a500' && (bgColor === 'rgb(240, 165, 0)' || bgColorRgb === 'rgb(240, 165, 0)')) {
            opt.classList.add('selected');
        }
        if (color === '#2ea043' && (bgColor === 'rgb(46, 160, 67)' || bgColorRgb === 'rgb(46, 160, 67)')) {
            opt.classList.add('selected');
        }
        if (color === '#f85149' && (bgColor === 'rgb(248, 81, 73)' || bgColorRgb === 'rgb(248, 81, 73)')) {
            opt.classList.add('selected');
        }
    });
}

function filterByCategory(categoryId, element) {
    currentCategoryFilter = categoryId;
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    if (element) element.classList.add('active');
    
    loadTasksWithCategories();
}

// ════════════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function escapeForAttr(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.remove('success', 'error', 'info');
    toast.classList.add(type, 'show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}