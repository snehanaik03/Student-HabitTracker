// ============================================
// STUDYTRACK - HABIT TRACKER JAVASCRIPT
// ============================================


// Store the ID when we are editing a habit
let editingId = null;


// ============================================
// GET ELEMENTS
// ============================================

const habitModal = document.getElementById("habitModal");

const habitForm = document.getElementById("habitForm");

const openModalButton =
    document.getElementById("openModalButton");

const emptyAddButton =
    document.getElementById("emptyAddButton");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelButton =
    document.getElementById("cancelButton");

const themeButton =
    document.getElementById("themeButton");



// ============================================
// LOAD HABITS FROM DATABASE
// ============================================

async function loadHabits() {

    try {

        const response = await fetch("/api/habits");

        const habits = await response.json();

        displayHabits(habits);

    } catch (error) {

        console.error("Error loading habits:", error);

    }

}



// ============================================
// DISPLAY HABITS
// ============================================

function displayHabits(habits) {

    const habitList =
        document.getElementById("habitList");


    // Clear old content
    habitList.innerHTML = "";


    // If there are no habits
    if (habits.length === 0) {

        habitList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    No habits yet
                </h3>

                <p>
                    Add your first habit and start building your routine.
                </p>

                <button
                    class="empty-button"
                    onclick="openAddModal()">

                    + Add Your First Habit

                </button>

            </div>

        `;

        updateStatistics(0, 0);

        return;
    }



    // Count completed habits
    let completedCount = 0;


    habits.forEach(habit => {

        if (Number(habit.completed) === 1) {

            completedCount++;

        }

    });



    // Create each habit
    habits.forEach(habit => {

        const habitElement =
            createHabitElement(habit);

        habitList.appendChild(habitElement);

    });



    // Update statistics
    updateStatistics(
        habits.length,
        completedCount
    );

}



// ============================================
// CREATE HABIT HTML
// ============================================

function createHabitElement(habit) {

    const div =
        document.createElement("div");


    div.className = "habit-item";


    // Add completed class
    if (Number(habit.completed) === 1) {

        div.classList.add("completed");

    }



    // Get category icon
    const icon =
        getCategoryIcon(habit.category);



    div.innerHTML = `

        <div class="habit-left">

            <button
                class="complete-button"
                onclick="completeHabit(${habit.id})">

                ${
                    Number(habit.completed) === 1
                    ? "✓"
                    : ""
                }

            </button>


            <div class="habit-icon">

                ${icon}

            </div>


            <div class="habit-information">

                <h3>
                    ${escapeHTML(habit.name)}
                </h3>

                <div class="habit-meta">

                    <span class="category-badge">

                        ${escapeHTML(habit.category)}

                    </span>

                    <span class="target-text">

                        🎯 ${habit.target}

                    </span>

                </div>

            </div>

        </div>


        <div class="habit-actions">

            <button
                class="edit-button"
                onclick="editHabit(
                    ${habit.id},
                    '${escapeQuotes(habit.name)}',
                    '${escapeQuotes(habit.category)}',
                    ${habit.target}
                )"
                title="Edit habit">

                ✏️

            </button>


            <button
                class="delete-button"
                onclick="deleteHabit(${habit.id})"
                title="Delete habit">

                🗑️

            </button>

        </div>

    `;


    return div;

}



// ============================================
// CATEGORY ICONS
// ============================================

function getCategoryIcon(category) {

    const icons = {

        "Study": "📚",

        "Placement": "💼",

        "Health": "❤️",

        "Project": "💻",

        "Personal": "🌱"

    };


    return icons[category] || "⭐";

}



// ============================================
// UPDATE STATISTICS
// ============================================

function updateStatistics(
    total,
    completed
) {

    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }



    // Total habits
    document.getElementById(
        "totalHabits"
    ).textContent = total;



    // Completed habits
    document.getElementById(
        "completedHabits"
    ).textContent = completed;



    // Percentage
    document.getElementById(
        "progressPercentage"
    ).textContent =
        percentage + "%";



    // Circle percentage
    document.getElementById(
        "circlePercentage"
    ).textContent =
        percentage + "%";



    // Progress bars

    const totalProgress =
        document.getElementById(
            "totalProgress"
        );

    if (totalProgress) {

        totalProgress.style.width =
            total > 0 ? "100%" : "0%";

    }



    const completedProgress =
        document.getElementById(
            "completedProgress"
        );

    if (completedProgress) {

        completedProgress.style.width =
            percentage + "%";

    }



    const percentageProgress =
        document.getElementById(
            "percentageProgress"
        );

    if (percentageProgress) {

        percentageProgress.style.width =
            percentage + "%";

    }



    // Circular progress
    const circle =
        document.querySelector(
            ".progress-circle"
        );


    if (circle) {

        circle.style.setProperty(
            "--progress",
            percentage
        );

    }



    // Progress message

    const message =
        document.getElementById(
            "progressMessage"
        );


    if (message) {

        if (total === 0) {

            message.textContent =
                "Start your first habit today!";

        }

        else if (percentage === 100) {

            message.textContent =
                "Amazing! You completed everything! 🎉";

        }

        else if (percentage >= 75) {

            message.textContent =
                "Almost there! Keep going! 🔥";

        }

        else if (percentage >= 50) {

            message.textContent =
                "Great progress! Keep it up! 💪";

        }

        else {

            message.textContent =
                "Every small step counts. Keep going! 🌱";

        }

    }

}



// ============================================
// OPEN ADD MODAL
// ============================================

function openAddModal() {

    editingId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add New Habit";


    document.getElementById(
        "habitName"
    ).value = "";


    document.getElementById(
        "habitCategory"
    ).value = "Study";


    document.getElementById(
        "habitTarget"
    ).value = "1";


    habitModal.classList.add("show");

}



// ============================================
// CLOSE MODAL
// ============================================

function closeModal() {

    habitModal.classList.remove("show");

    editingId = null;

}



// ============================================
// ADD / EDIT HABIT
// ============================================

habitForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "habitName"
            ).value.trim();


        const category =
            document.getElementById(
                "habitCategory"
            ).value;


        const target =
            document.getElementById(
                "habitTarget"
            ).value;



        // Check name
        if (name === "") {

            alert(
                "Please enter a habit name."
            );

            return;

        }



        const data = {

            name: name,

            category: category,

            target: Number(target)

        };



        try {

            let url = "/api/habits";

            let method = "POST";



            // If editing
            if (editingId !== null) {

                url =
                    `/api/habits/${editingId}`;

                method = "PUT";

            }



            const response =
                await fetch(
                    url,
                    {

                        method: method,

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );



            if (!response.ok) {

                throw new Error(
                    "Failed to save habit"
                );

            }



            closeModal();

            await loadHabits();



        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong. Please try again."
            );

        }

    }
);



// ============================================
// COMPLETE HABIT
// ============================================

async function completeHabit(id) {

    try {

        const response =
            await fetch(
                `/api/habits/${id}/complete`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update habit"
            );

        }


        await loadHabits();


    } catch (error) {

        console.error(
            "Error completing habit:",
            error
        );

    }

}



// ============================================
// DELETE HABIT
// ============================================

async function deleteHabit(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this habit?"
        );


    if (!confirmation) {

        return;

    }



    try {

        const response =
            await fetch(
                `/api/habits/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete habit"
            );

        }


        await loadHabits();


    } catch (error) {

        console.error(
            "Error deleting habit:",
            error
        );

    }

}



// ============================================
// EDIT HABIT
// ============================================

function editHabit(
    id,
    name,
    category,
    target
) {

    editingId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Habit";


    document.getElementById(
        "habitName"
    ).value =
        name;


    document.getElementById(
        "habitCategory"
    ).value =
        category;


    document.getElementById(
        "habitTarget"
    ).value =
        target;


    habitModal.classList.add("show");

}



// ============================================
// BUTTON EVENTS
// ============================================

openModalButton.addEventListener(
    "click",
    openAddModal
);


emptyAddButton.addEventListener(
    "click",
    openAddModal
);


closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelButton.addEventListener(
    "click",
    closeModal
);



// ============================================
// CLICK OUTSIDE MODAL
// ============================================

habitModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === habitModal
        ) {

            closeModal();

        }

    }
);



// ============================================
// ESCAPE KEY
// ============================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);



// ============================================
// DARK / LIGHT MODE
// ============================================

themeButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "light-mode"
        );


        const isLight =
            document.body.classList.contains(
                "light-mode"
            );


        themeButton.textContent =
            isLight ? "☀️" : "🌙";


        localStorage.setItem(
            "theme",
            isLight ? "light" : "dark"
        );

    }
);



// ============================================
// LOAD SAVED THEME
// ============================================

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "light") {

    document.body.classList.add(
        "light-mode"
    );

    themeButton.textContent = "☀️";

}



// ============================================
// SECURITY
// ============================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function escapeQuotes(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}



// ============================================
// START APPLICATION
// ============================================

loadHabits();