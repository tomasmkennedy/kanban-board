import React from 'react';

export const Form = ({ onSubmit, name }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Task Name</label>
        <input className="form-control" id="name" maxLength="18" defaultValue={name} />
      </div>
      <div className="form-group-button">
        <button className="form-control btn btn-primary" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
};
export default Form;