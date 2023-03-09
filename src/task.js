import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import Modal from 'react-bootstrap/Modal';
import { Form } from './form';
import CloseButton from 'react-bootstrap/CloseButton'
import 'bootstrap/dist/css/bootstrap.min.css';
import firebase, { db, auth } from './utils/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
`;

async function upload(id, event) {
    const task = {
        content: event.target.name.value,
        id: id
    }
    const users = collection(db, "users");
    const userQuery = query(users, where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(userQuery);
    var docId = null;
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        docId = doc.id;
    });
    await setDoc(doc(db, "users", docId, "tasks", id), {
        task
    });
}

export default class Task extends React.Component {
    constructor() {
        super();
        this.state = { show: false };
    }
    onSubmit = (event) => {
        event.preventDefault();
        this.handleClose();
        if (event.target.name.value.trim()) {
            upload(this.props.task.id, event);
            this.props.updateTasks(event.target.name.value, this.props.task.id);
        }
    }
    handleClose = () => {
        this.setState({ show: false });
    }
    handleOpen = () => {
        this.setState({ show: true });
    }
    render() {
        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index}>
                {(provided, snapshot) => (
                    <Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        innerRef={provided.innerRef}
                        isDragging={snapshot.isDragging}
                    >
                        <div onClick={this.handleOpen}>
                            {this.props.task.content}
                        </div>
                        <Modal
                            show={this.state.show}
                            onHide={this.handleClose}
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header>
                                <Modal.Title>Edit Task</Modal.Title>
                                <CloseButton onClick={this.handleClose} />
                            </Modal.Header>
                            <Modal.Body><Form onSubmit={this.onSubmit} Name={this.props.task.content} /></Modal.Body>
                        </Modal>
                    </Container>
                )}
            </Draggable>
        );
    }
}
