document.addEventListener('DOMContentLoaded', () => {

    // серверные функции
    async function getStudentsFromServer() {
        const response = await fetch('http://localhost:3000/students');
        const data = await response.json();

        return data || [];
    }

    function addStudentToServer(studentObj) {
        fetch('http://localhost:3000/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentObj)
        });
    }

    function deleteStudentFromServer(studentId) {
        fetch(`http://localhost:3000/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // фильтрация и сортировка студентов
    function sortStudentsArray(studentsArray, key) {
        const sortedStudentsArray = studentsArray.slice().sort((student, prevStudent) => {
            let currentValue = student[key];
            let prevValue = prevStudent[key];

            if (key === 'name') {
                currentValue = (student.surname + student.name + student.middlename).toLowerCase();
                prevValue = (prevStudent.surname + prevStudent.name + prevStudent.middlename).toLowerCase();
            }
            if (currentValue > prevValue) {
                return 1;
            }
            if (currentValue < prevValue) {
                return -1;
            }
            return 0;
        }); 
        
        return sortedStudentsArray;
    }

    function filterStudentsArray(studentsArray, inputValue, key) {
        
        if (key === 'name') {
            return studentsArray.filter(student => 
                (student.surname + ' ' + student.name + ' ' + student.middlename).toLowerCase().includes(inputValue.toLowerCase()));
        }
        else if (key === 'faculty') {
            return studentsArray.filter(student => (student[key]).includes(inputValue));
        }
        else if (key === 'start') {
            return studentsArray.filter(student => student.startOfStudying.includes(inputValue));
        }
        else {
            return studentsArray.filter(student => 
                String(Number(student.startOfStudying) + 4).includes(inputValue));
        }
    }

    //форматирование текста
    function getStudentAge(birthDate) {
        const now = new Date();
        
        const age = now.getFullYear() - birthDate.getFullYear();

        if (
            now.getMonth() < birthDate.getMonth() || 
            (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())
        ) {
            return age - 1;
        }
        
        return age;  
    }
    
    function formatStudentCourse(studyingDate) {
        if (Number(studyingDate) <= 2019) {
            return '(Закончил)';
        }
        return `(${2023 - Number(studyingDate) + 1} курс)`;
    }

    function formatFullName(studentObj) {
        return `${studentObj.surname} ${studentObj.name} ${studentObj.middlename}`;
    }

    function formatYearsOfStudy(studentObj) {
        return `${studentObj.startOfStudying} - ${Number(studentObj.startOfStudying) + 4} ${formatStudentCourse(studentObj.startOfStudying)}`;
    }

    function formatTime(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const formattedDay = day < 10 ? `0${day}` : day;
        const formattedMonth = month < 10 ? `0${month}` : month;

        const formattedDate = `${formattedDay}.${formattedMonth}.${year}`;

        return formattedDate;
    }

    // table rendering
    function createStudentRow(studentsArray, studentObj, onDelete) { 
        const studentRow = document.createElement('tr');
    
        const deleteButtonTd = document.createElement('td');
        deleteButtonTd.dataset.id = studentObj.id;
        deleteButtonTd.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/> 
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/> </svg>`;
        deleteButtonTd.classList.add('delete-button');
        deleteButtonTd.addEventListener('click', () => {
            const studentId = deleteButtonTd.dataset.id;
            onDelete(studentId);
            studentsArray = studentsArray.filter(student => student.id !== studentId);
            studentRow.remove();
        });

        const fullNameTd = document.createElement('td');
        const facultyTd = document.createElement('td');
        const dateOfBirthTd = document.createElement('td');
        const yearsOfStudyTd = document.createElement('td');
    
        fullNameTd.textContent = formatFullName(studentObj);
        facultyTd.textContent = studentObj.faculty;
        dateOfBirthTd.textContent = `${formatTime(studentObj.dateOfBirth)} (${getStudentAge(studentObj.dateOfBirth)} лет)`;
        yearsOfStudyTd.textContent = formatYearsOfStudy(studentObj);

        studentRow.append(
            deleteButtonTd,
            fullNameTd, 
            facultyTd,
            dateOfBirthTd,
            yearsOfStudyTd
        );
        
        return studentRow; //tr
    }

    function renderStudentsTable(studentsArray, onDelete) {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = '';
        
        studentsArray.forEach(student => {
            const studentRow = createStudentRow(studentsArray, student, onDelete);
            tableBody.append(studentRow);
        });
    }

    function createUserInput(studentsArray, onAdd) {
        const inputs = [
            document.getElementById('surNameInput'),
            document.getElementById('nameInput'),
            document.getElementById('middleNameInput'),
            document.getElementById('birthDateInput'),
            document.getElementById('facultyInput'),
            document.getElementById('studyStartInput')
        ];

        const confirmButton = document.querySelector('.btn');
        
        confirmButton.addEventListener('click', () => {
            const isEmpty = inputs.some(input => input.value.trim() === '');

            if (isEmpty) {
                displayError('Не все поля заполнены');
                return;
            } 
            else {
                if (validateDateOfBirth(new Date(inputs[3].valueAsDate)) && validateStartStudyingYear(inputs[5].value)) {
                    displayError('');

                    const studentObj = {
                        surname: inputs[0].value, 
                        name: inputs[1].value,
                        middlename: inputs[2].value,
                        faculty: inputs[4].value,
                        dateOfBirth: new Date(inputs[3].valueAsDate),
                        startOfStudying: inputs[5].value,
                    };

                    onAdd(studentObj); //
    
                    studentsArray.push(studentObj);
                    renderStudentsTable(studentsArray);
                }
                else {
                    if (validateDateOfBirth(new Date(inputs[3].valueAsDate)) === false) {
                        displayError('Минимальный год рождения - 1900 г.');
                    }
                    else if (validateStartStudyingYear(inputs[5].value) === false) {
                        displayError('Минимальный год начала обучения - 2000 г.');
                    }
                }
            }

            inputs.forEach(input => input.value = '');
        });
    }

    function createTableControls() {
        const filterInputs = [
            document.getElementById('name-filter'),
            document.getElementById('faculty-filter'),
            document.getElementById('studying-start-filter'),
            document.getElementById('studying-end-filter')
        ];
    
        const sortButtons = [
            document.getElementById('name'),
            document.getElementById('faculty'),
            document.getElementById('birth-date'),
            document.getElementById('study')
        ];
    
        return {
            filterInputs,
            sortButtons
        };
    }

    // Валидация даты рождения
    function validateDateOfBirth(inputDate) {
        const minDate = new Date(1900, 0, 1);
        const now = new Date();

        return (minDate <= inputDate) && (inputDate < now);
    }

    // Валидация года начала учебы
    function validateStartStudyingYear(year) {
        return (year >= 2000) && (year <= 2023);
    }
    
    function displayError(message) {
        const label = document.querySelector('.alert-label');
        label.textContent = message;
    }

    // tableControls event listeners
    function setupFilterListeners(filterInputs, studentsArray, onDelete) {
        filterInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                const key = index === 0 ? 'name' : index === 1 ? 'faculty' : index === 2 ? 'start' : 'end';
                renderStudentsTable(filterStudentsArray(studentsArray, input.value, key), onDelete);
            });
        });
    }
    
    function setupSortListeners(sortButtons, studentsArray, onDelete) {
        sortButtons.forEach((sortButton, index) => {
            sortButton.addEventListener('click', () => {
                const key = index === 0 ? 'name' : index === 1 ? 'faculty' : index === 2 ? 'dateOfBirth' : 'startOfStudying';
                renderStudentsTable(sortStudentsArray(studentsArray, key), onDelete);
            });
        });
    }

    async function createTableApp() {
        let studentsList = await getStudentsFromServer();
        
        const handlers = {
            onDelete(studentId) {
                deleteStudentFromServer(studentId);
                const studentIndex = studentsList.findIndex(student => student.id == studentId);
                if (studentIndex !== -1) {
                    studentsList.splice(studentIndex, 1);
                }
            },
            onAdd(studentObj) {
                addStudentToServer(studentObj);
            }
        };

        if (studentsList.length) {
            studentsList.forEach(student => {
                student.dateOfBirth = new Date(student.dateOfBirth);
            });
        } 
        
        const { filterInputs, sortButtons } = createTableControls();
        
        setupFilterListeners(filterInputs, studentsList, handlers.onDelete);
        setupSortListeners(sortButtons, studentsList, handlers.onDelete);

        renderStudentsTable(studentsList, handlers.onDelete);
        createUserInput(studentsList, handlers.onAdd);
    }
    
    createTableApp();
});