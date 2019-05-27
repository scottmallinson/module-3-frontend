import React, { Component } from "react";
import { withAuth } from "../lib/AuthProvider";
import recipe from '../lib/recipe-service';

class Recipes extends Component {
  constructor(props) {
    super(props)
    this.state = {
      creatorId: this.props.user._id,
      name: '',
      description: '',
      photoUrl: '',
      duration: '',
      ingredients: [{
        name: '',
        quantity: ''
      }],
      instructions: [],
      servings: ''
    }
  }

  handleItemChange(e, inputIndex) {
    const { ingredients } = this.state;
    let newIngredients = [...ingredients];
    newIngredients.map((_, index, newIngredients) => {
      return index === inputIndex ? newIngredients[index][e.target.name] = e.target.value : null;
    })
    this.setState({
      ingredients: newIngredients,
    })
  }

  handleItemRemove(e, index) {
    e.preventDefault();
    this.state.ingredients.splice(index, 1);
    this.setState({
      ingredients: this.state.ingredients
    })
  }

  addItem(e, items) {
    e.preventDefault();
    this.setState({
      ingredients: [...this.state.ingredients, {
        name: '',
        quantity: ''
      }]
    })
  }

  handleInstructionChange(e, inputIndex) {
    const { instructions } = this.state;
    let newInstructions = [...instructions];
    newInstructions.map((_, index, newInstructions) => {
      return index === inputIndex ? newInstructions[index] = e.target.value : null;
    })
    this.setState({
      instructions: newInstructions,
    })
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleInstructionRemove(e, index) {
    e.preventDefault();
    this.state.instructions.splice(index, 1);
    this.setState({
      instructions: this.state.instructions
    })
  }

  addInstruction(e, items) {
    e.preventDefault();
    this.setState({
      instructions: [...this.state.instructions, '']
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state.ingredients, this.state.instructions);
    const { creatorId, name, description, photoUrl, duration, ingredients, instructions, servings } = this.state;
    recipe.create({
      creatorId,
      name,
      description,
      photoUrl,
      duration,
      ingredients,
      instructions,
      servings
    })
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div className="container pt-5">
        <h1 className="display-4">Add your recipe</h1>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" placeholder="Recipe name" type="text" required="required" className="form-control" value={this.state.name} onChange={(e) => this.handleChange(e)} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" cols="40" rows="5" aria-describedby="descriptionHelpBlock" required="required" className="form-control" value={this.state.description} onChange={(e) => this.handleChange(e)}></textarea>
            <span id="descriptionHelpBlock" className="form-text text-muted">Provide a description of the recipe.</span>
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input id="duration" name="duration" type="text" required="required" className="form-control" value={this.state.duration} onChange={(e) => this.handleChange(e)} />
          </div>
          <div className="form-group">
            <label htmlFor="servings">Servings</label>
            <input id="servings" name="servings" type="text" required="required" className="form-control" value={this.state.servings} onChange={(e) => this.handleChange(e)} />
          </div>
          <div className="form-group">
            <label htmlFor="ingredients_1">Ingredients</label>
            {
              this.state.ingredients.map((ingredient, index) => {
                return (
                  <div className="form-row" key={index}>
                    <div className="col">
                      <input className="form-control" onChange={(e) => this.handleItemChange(e, index)} value={ingredient.name} name="name" />
                    </div>
                    <div className="col">
                      <input className="form-control" onChange={(e) => this.handleItemChange(e, index)} value={ingredient.quantity} name="quantity" />
                    </div>
                    <div className="col">
                      <button className="btn btn-warning" onClick={(e) => this.handleItemRemove(e, index)}>Remove</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" onClick={(e) => this.addItem(e)}>Add ingredient</button>
          </div>
          <div className="form-group">
            <label htmlFor="instructions_!">Instructions</label>
            {
              this.state.instructions.map((instruction, index) => {
                return (
                  <div className="form-row" key={index}>
                    <div className="col">
                      <textarea className="form-control" onChange={(e) => this.handleInstructionChange(e, index)} value={instruction}></textarea>
                    </div>
                    <div className="col">
                      <button className="btn btn-warning" onClick={(e) => this.handleInstructionRemove(e, index)}>Remove</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" onClick={(e) => this.addInstruction(e)}>Add instruction</button>
          </div>
          <div className="form-group">
            <button name="submit" type="submit" className="btn btn-success" onClick={(e) => this.handleSubmit(e)}>Save recipe</button>
          </div>
        </form>
      </div>
    );
  }
}

export default withAuth(Recipes);
