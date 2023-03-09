import React from 'react';
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import Task from './task';

const Container = styled.div`
  margin: 8px;
  margin-top: 24px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;
  height: 600px;
  display: flex;
  flex-direction: column;
`;
const Title = styled.h3`
  padding: 8px;
  text-align: center;
`;
const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props =>
        props.isDraggingOver ? 'lightgrey' : 'inherit'};
  flex-grow: 1;
  min-height: 100px;
`;

class InnerList extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.tasks === this.props.tasks) {
            return false;
        }
        return true;
    }
    render() {
        return this.props.tasks.map((task, index) => (
            <Task key={task.id} task={task} index={index} updateTasks={this.props.updateTasks} />
        ));
    }
}


export default class Column extends React.Component {
    render() {
        return (
            <Container style={{ backgroundColor: this.props.column.color }}>
                <Title>
                    {this.props.column.title}
                </Title>
                <Droppable droppableId={this.props.column.id} type="task">
                    {(provided, snapshot) => (
                        <TaskList
                            innerRef={provided.innerRef}
                            {...provided.droppableProps}
                            isDraggingOver={snapshot.isDraggingOver}
                        >
                            <InnerList tasks={this.props.tasks} updateTasks={this.props.updateTasks} />
                            {provided.placeholder}
                        </TaskList>
                    )}
                </Droppable>
            </Container>
        );
    }
}
