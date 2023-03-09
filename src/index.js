import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';
import firebase, { db, auth, addInitialData } from './utils/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import 'firebase/compat/firestore';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from './utils/register';
import Login from './utils/login';
import Reset from './utils/reset';
import Dashboard from './utils/dashboard';


const Container = styled.div`
  display: flex;
`;

const onAuthStateChangedPromise = new Promise((resolve, reject) => {
  auth.onAuthStateChanged(user => {
    resolve(user)
  }, err => {
    reject(err)
  })
})

async function getTasks() {
  await onAuthStateChangedPromise;
  const users = collection(db, "users");
  const userQuery = query(users, where("uid", "==", auth.currentUser.uid));
  const querySnapshot = await getDocs(userQuery);
  var docId = null;
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    docId = doc.id;
  });
  const snapshotT = await firebase.firestore().collection('users').doc(docId).collection('tasks').get();
  const snapshotC = await firebase.firestore().collection('users').doc(docId).collection('columns').get();
  const tasklist = {
  };
  const columnlist = {
  };
  const list = {
  };
  snapshotT.docs.map(doc =>
    tasklist[doc.data().task.id] = doc.data().task,
  )
  snapshotC.docs.map(doc =>
    columnlist[doc.data().column.id] = doc.data().column,
  )
  list.columns = columnlist;
  list.tasks = tasklist;
  // return snapshot.docs.map(doc => doc.data());
  return list;
}

async function uploadColumns(column, id) {
  const users = collection(db, "users");
  const userQuery = query(users, where("uid", "==", auth.currentUser.uid));
  const querySnapshot = await getDocs(userQuery);
  var docId = null;
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });
  await setDoc(doc(db, "users", docId, "columns", id), {
    column
  });
  return;
}

class InnerList extends React.PureComponent {
  render() {
    const { column, taskMap, index, updateTasks } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} updateTasks={updateTasks}></Column>;
  }
}

function putTasks(state, columnId, index, updateTasks) {
  const column = state.columns[columnId];
  if (state.fetched && typeof column !== 'undefined') {
    return (
      <InnerList
        key={column.id}
        column={column}
        taskMap={state.tasks}
        index={index}
        updateTasks={updateTasks}
      />
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialData;
    this.updateTasks = this.updateTasks.bind(this);
  }

  componentDidMount() {
    let newState = initialData;
    getTasks().then(function (result) {
      newState.tasks = result.tasks;
      newState.columns = result.columns;
    }).then(() => {
      this.setState({ fetched: true });
      this.setState({ ...this.state, tasks: newState.tasks, columns: newState.columns });
    })
  }

  updateTasks = (task, id) => {
    let newState = { ...this.state };
    newState.tasks[id].content = task;
    this.setState(newState);
  }

  onDragEnd = result => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // if (type === 'column') {
    //   const newColumnOrder = Array.from(this.state.columnOrder);
    //   newColumnOrder.splice(source.index, 1);
    //   newColumnOrder.splice(destination.index, 0, draggableId);

    //   const newState = {
    //     ...this.state,
    //     columnOrder: newColumnOrder,
    //   };
    //   this.setState(newState);
    //   return;
    // }

    const home = this.state.columns[source.droppableId];
    const foreign = this.state.columns[destination.droppableId];

    if (home === foreign) {
      const newTaskIds = Array.from(home.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newHome = {
        ...home,
        taskIds: newTaskIds,
      };

      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newHome.id]: newHome,
        },
      };
      this.setState(newState);
      uploadColumns(this.state.columns[newHome.id], newHome.id);
      return;
    }

    // moving from one list to another
    const homeTaskIds = Array.from(home.taskIds);
    homeTaskIds.splice(source.index, 1);
    const newHome = {
      ...home,
      taskIds: homeTaskIds,
    };

    const foreignTaskIds = Array.from(foreign.taskIds);
    foreignTaskIds.splice(destination.index, 0, draggableId);
    const newForeign = {
      ...foreign,
      taskIds: foreignTaskIds,
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newHome.id]: newHome,
        [newForeign.id]: newForeign,
      },
    };
    this.setState(newState);
    uploadColumns(this.state.columns[newHome.id], newHome.id);
    uploadColumns(this.state.columns[newForeign.id], newForeign.id);
  };
  render() {
    return (
      <div className="wrapper" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {provided => (
              <Container
                {...provided.droppableProps}
                innerRef={provided.innerRef}
              >
                {putTasks(this.state, 'column-1', 0, this.updateTasks)}
                {putTasks(this.state, 'column-2', 1, this.updateTasks)}
                {putTasks(this.state, 'column-3', 2, this.updateTasks)}
                {putTasks(this.state, 'column-4', 3, this.updateTasks)}
                {putTasks(this.state, 'column-5', 4, this.updateTasks)}
                {provided.placeholder}
              </Container>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
}

class Home extends React.Component {
  render() {
    return (
      <div>
        <Dashboard />
        <App />
      </div>
    )
  }
}

class Pages extends React.Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/home" element={<Home />} />
        </Routes>
      </Router>
    )
  }
}

ReactDOM.render(<Pages />, document.getElementById('root'));
