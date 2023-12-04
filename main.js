// import '' ??????
var tasks = [];
const API_URL = "https://f7c7p33kzg.execute-api.ap-south-1.amazonaws.com/Develop/task-management-serverless";

const validateForm = () => {
    
    var title = $('#title').val();
    var description = $('#description').val();
    var priority = $('#priority').val();
    var status = $('#status').val();
    var enddate = $('#enddate').val();
    var teamsize = $('#teamsize').val();

    if(title == "") {
        alert('Title is required');
        return false;
    }

    if(description == "") {
        alert('Description is required');
        return false;
    }

    if(priority == "") {
        alert('Priority is required');
        return false;
    }

    if(status == "") {
        alert('Status is required');
        return false;
    }

    if(enddate == "") {
        alert('End date is required');
        return false;
    }

    if(teamsize <= 1) {
        alert('Team size must be equal to or greater than 1');
        return false;
    }

    return true;
}

const updateTask = (id) => {
    $('#Submit').hide();
    $('#Update').show();

    var tasklist;

    if(JSON.parse(localStorage.getItem('tasks')) == null) {
        tasklist = [];
    } else {
        tasklist = JSON.parse(localStorage.getItem('tasks'));
    }
    
    var itemIndex = tasklist.findIndex((element) => element.id == id);
    var currentItem = tasklist[itemIndex]

    $('#title').val(currentItem.title);
    $('#description').val(currentItem.description);
    $('#priority').val(currentItem.priority);
    $('#status').val(currentItem.status);
    $('#enddate').val(currentItem.enddate);
    $('#teamsize').val(currentItem.teamsize);

    $('#Update').on('click', function () {
        
        if(validateForm() == true) {
            
            currentItem.title = $('#title').val();
            currentItem.description = $('#description').val();
            currentItem.priority = $('#priority').val();
            currentItem.status = $('#status').val();
            currentItem.enddate = $('#enddate').val();
            currentItem.teamsize = $('#teamsize').val();

            localStorage.setItem('tasks', JSON.stringify(tasklist));
            
            fetchTasks();

            $('#title').val("");
            $('#description').val("");
            $('#priority').val("");
            $('#status').val("");
            $('#enddate').val("");
            $('#teamsize').val("");
    
            $('#Submit').show();
            $('#Update').hide();
    
        }
    });
}

const makeRequestToAWS = (requestParameters) => {
    debugger
    return new Promise(async (resolve, reject) => {
        $.ajax({
            url: getURL(requestParameters),
            method: requestParameters.method,
            data: requestParameters.method == 'POST' && requestParameters.data != null ? 
                    JSON.stringify(requestParameters.data) : null,
            success: function(res) {
                console.log(res);
                resolve(res);
            },
            error: function(error) {
                console.log(error);
                reject(error);
            }
        })
    });
}

const getURL = (requestParameters) => {
    if(requestParameters.method == 'GET') {
        return API_URL + requestParameters.getEndpoint
    } else if(requestParameters.method == 'DELETE') {
        return API_URL + `?taskid=${requestParameters.data.taskid}`
    } else if(requestParameters.method == 'POST') {
        return API_URL
    }

} 

const fetchTasks = async(type) => {
    try {
        
        var requestParameters = {
            method: 'GET',
            getEndpoint: type == 'all' ? '/all' : '/single'
        }
    
        tasks = await makeRequestToAWS(requestParameters);
        await displayTasks(tasks)

    } catch (error) {
        
    }
}

const createTask = async() => {

    if(validateForm() == true) {
        var task = {}
        
        task.task_title = $('#title').val();
        task.task_description = $('#description').val();
        task.task_priority = $('#priority').val();
        task.task_status = $('#status').val();
        task.task_enddate = $('#enddate').val();
        task.task_teamsize = $('#teamsize').val();

        var requestParameters = {
            method: 'POST',
            data: task
        }

        var response = await makeRequestToAWS(requestParameters);
        // console.log(response)

        // await displayTasks(tasks);
        await fetchTasks('all');
        
        $('#title').val("");
        $('#description').val("");
        $('#priority').val("");
        $('#status').val("");
        $('#enddate').val("");
        $('#teamsize').val("");
    }
}

const displayTasks = async(tasks) => {

    var record = "";

    $.each(tasks, function() {
        record += `<tr>
            <td>${this.id}</td>
            <td>${this.title}</td>
            <td>${this.description}</td>
            <td>${this.priority}</td>
            <td>${this.status}</td>
            <td>${this.enddate}</td>
            <td>${this.teamsize}</td>
            <td>
                <button class="btn btn-danger delete-task" data-taskid="${this.id}">Delete</button>
            </td>
        </tr>`

        
    })

    // <button class="btn btn-warning" onclick="updateTask(${this.id})">Edit</button>
    $($('#data')[0]).html(record);
}

const deleteTask = async(id) => {
    debugger
    var requestParameters = {
        method: 'DELETE',
        data: {taskid: id}
    }

    await makeRequestToAWS(requestParameters);

    await fetchTasks('all');
    
}

$(document).ready(async function() { 
    await fetchTasks('all');
    $('#data').on('click', '.delete-task', function() {
        var taskid = $(this).data('taskid');
        deleteTask(taskid);
    });
});

