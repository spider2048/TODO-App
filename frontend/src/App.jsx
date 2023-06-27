import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from 'axios'

const baseURL = 'http://localhost:9000'


function App() {
    const [lastAlert, setLastAlert] = useState(<></>)
    let [tasks, setTasks] = useState([])

    
    function Task(props) {
        const {id, title, due, status} = props
        const date = new Date(due)

        const toggleTask = (id) => {
            axios.post(`${baseURL}/toggleTask`, {id: id}).then(r => {

                const idx = tasks.findIndex(r => r.id == id)
                tasks[idx].status = tasks[idx].status == 1 ? 0: 1
                setTasks(tasks)
                
                setLastAlert(
                    <div className="alert alert-primary" role="alert">
                        Task '{tasks[idx].title}' is updated! #{id}
                    </div>
                )
            })
        }

        return (
            <div key={id} className="card m-3 mx-auto w-50">
                <div className="card-body" style={(new Date().valueOf() > due && status == 0) ? {backgroundColor: '#FFCCCB'}: {}}>
                    <div className="d-flex flex-row">
                        <input className="form-check-input" type="checkbox" onClick={() => toggleTask(id)} defaultChecked={status == 1} />
                        <h6 className="form-check-label card-title mx-1"> {title} </h6>
                    </div>
                    
                    <footer className="blockquote-footer mt-3">
                        Due on {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </footer>
                </div>
            </div>
        )
    }

    useEffect(() => {
        axios.get(`${baseURL}/listTasks`).then(r => {
            setTasks(r.data)
        })
    }, [])

    const addTask = () => {
        const title = document.getElementById('description').value
        const due = new Date(document.getElementById('deadline').value).valueOf()

        axios.post(`${baseURL}/addTask`, {title: title, due: due}).then(r => {
            tasks.push({id: r.data, title: title, due: due, status: 0})
            setTasks(tasks)

            setLastAlert(
                <div className="alert alert-primary" role="alert">
                    Task {title} is added! #{tasks.length}
                </div>
            )
        }).catch(e => {
            setLastAlert(
                <div className="alert alert-danger" role='alert'>
                    Adding Task with description: '{title}' and date: '{due.toString()}' failed with {e.toString()}
                </div>
            )
        })
    }

    const activeTasks = tasks.filter(t => t.status == 0)
    const finishedTasks = tasks.filter(t => t.status == 1)

    return (<>
    <div className="container">
        <h1 className="text-center my-3 mx-auto" style={{width: 'max-content'}}> #Todo App </h1>
        <h4 className="text-center">Total: {tasks.length} Active: {activeTasks.length} Finished: {finishedTasks.length} </h4>
        <div className="add-task w-50 d-flex mx-auto flex-row">
            <input id='description' className='form-control my-5 mx-1' placeholder="Description" type="text"/>
            <input id='deadline' type='datetime-local' className='form-control my-5 mx-1' placeholder="Deadline"/>
            <button className='btn btn-outline-primary my-5 mx-1' onClick={addTask}>Add</button>
        </div>  



        {lastAlert}

        <Tabs className="float-center">
        <TabList>
            <Tab key={0}>All</Tab>
            <Tab key={1}>Active</Tab>
            <Tab key={2}>Completed</Tab>
        </TabList>

        <TabPanel>
            {tasks.map(t => Task(t))}
        </TabPanel>

        <TabPanel>
            {activeTasks.map(t => Task(t))}
        </TabPanel>

        <TabPanel>
            {finishedTasks.map(t => Task(t))}
        </TabPanel>
        </Tabs>
    </div>
    </>);
}

export default App
