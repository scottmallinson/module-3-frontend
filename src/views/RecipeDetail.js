import React, { Component } from "react";
import { withAuth } from './../lib/AuthProvider';
import { Helmet } from 'react-helmet';
import user from '../lib/user-service';
import recipe from '../lib/recipe-service';
const moment = require('moment');

class RecipeDetail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      _id: this.props.match.params.id,
      creatorId: {},
      hasRecipe: false,
      editable: false,
      editing: false,
      disable: true,
      savedRecipes: [],
      saved: null
    }
  }

  isSaved() {
    if (this.state.savedRecipes.includes(this.state._id)) {
      this.setState({
        saved: true
      })
    } else {
      this.setState({
        saved: false
      })
    }
  }

  handleSaveRecipe = e => {
    e.preventDefault();
    const recipeId = this.state._id;
    const userId = this.props.user._id;
    recipe.saveRecipe({
      recipeId,
      userId
    })
      .then((response) => this.setState({ saved: true }))
      .catch((error) => console.log(error));
  }

  handleUnsaveRecipe = e => {
    e.preventDefault();
    const recipeId = this.state._id;
    const userId = this.props.user._id;
    recipe.unsaveRecipe({
      recipeId,
      userId
    })
      .then(() => this.setState({ saved: false }))
      .catch((error) => console.log(error))
  }

  handleEditRecipe = e => {
    e.preventDefault();
    this.setState({
      editing: !this.state.editing,
      disable: false
    })
  }

  handleItemChange = (e, inputIndex) => {
    const { ingredients } = this.state;
    let newIngredients = [...ingredients];
    newIngredients.map((_, index, newIngredients) => {
      return index === inputIndex ? newIngredients[index][e.target.name] = e.target.value : null;
    })
    this.setState({
      ingredients: newIngredients
    })
  }

  handleItemRemove = (e, index) => {
    e.preventDefault();
    this.state.ingredients.splice(index, 1);
    this.setState({
      ingredients: this.state.ingredients
    })
  }

  addItem = e => {
    e.preventDefault();
    this.setState({
      ingredients: [...this.state.ingredients, {
        name: '',
        quantity: ''
      }]
    })
  }

  handleInstructionChange = (e, inputIndex) => {
    const { instructions } = this.state;
    let newInstructions = [...instructions];
    newInstructions.map((_, index, newInstructions) => {
      return index === inputIndex ? newInstructions[index] = e.target.value : null;
    })
    this.setState({
      instructions: newInstructions,
    })
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleInstructionRemove = (e, index) => {
    e.preventDefault();
    this.state.instructions.splice(index, 1);
    this.setState({
      instructions: this.state.instructions
    })
  }

  addInstruction = e => {
    e.preventDefault();
    this.setState({
      instructions: [...this.state.instructions, '']
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { _id, creatorId, name, description, photoUrl, duration, ingredients, instructions, servings } = this.state;
    recipe.updateRecipe({
      _id,
      creatorId,
      name,
      description,
      photoUrl,
      duration,
      ingredients,
      instructions,
      servings
    })
      .then(() => this.setState({ editing: false }))
      .catch((error) => console.log(error));
  }

  componentDidMount() {
    recipe.getRecipeById(this.state._id)
      .then((response) => {
        const { creatorId, name, description, photoUrl, duration, ingredients, instructions, servings, created_at, updated_at } = response
        this.setState({
          creatorId,
          name,
          description,
          photoUrl,
          duration,
          ingredients,
          instructions,
          servings,
          created_at: created_at,
          updated_at: updated_at,
          hasRecipe: true
        })
        if (this.props.user && this.props.user._id === this.state.creatorId._id) {
          this.setState({
            editable: true
          })
        }
      })
      .catch((error) => console.log(error))

    if (this.props.user) {
      user.getSavedRecipes(this.props.user._id)
        .then((data) => {
          this.setState({ savedRecipes: data.savedRecipes })
          this.isSaved()
        })
        .catch((error) => console.log(error))
    }
  }

  fileOnchange = e => {
    const file = e.target.files[0];
    const uploadData = new FormData()
    uploadData.append('recipease', file)
    recipe.uploadRecipeImage(uploadData)
      .then((photoUrl) => {
        this.setState({
          photoUrl,
          disable: false,
        })
      })
      .catch((error) => console.log(error))
  }

  checkContributor() {
    if (this.props.user && this.props.user._id === this.state.creatorId._id) {
      return ('you')
    } else {
      return (this.state.creatorId.username);
    }
  }

  render() {
    const { disable } = this.state
    return (
      !this.state.hasRecipe ? null :
        <>
          <Helmet>
            <title>{this.state.name} &middot; Recipease</title>
            <meta name="description" content={this.state.description} />
            <meta property="og:type" content="article" />
            <meta property="og:image" content={this.state.photoUrl} />
            <meta property="article:author" content={this.state.creatorId.username} />
            <meta property="article:published_time" content={this.state.created_at} />
            <meta property="article:modified_time" content={this.state.updated_at} />
          </Helmet>
          <div className="container p-0 py-5">
            <div className="card mb-3">
              <img src={this.state.photoUrl} className="card-img" alt={this.state.name} loading="eager" />
              <div className="card-body">
                <h1 className="card-title">{this.state.name}</h1>
                <p className="lead card-text">{this.state.description}</p>
                <p className="text-muted small">Contributed by {this.checkContributor()}</p>
                <div className="d-flex justify-content-between mb-3">
                  {this.state.editable && !this.state.editing ? <button className="btn btn-outline-secondary" type="submit" onClick={this.handleEditRecipe}>Edit recipe</button> : null}
                  {this.props.isLoggedin && !this.state.saved && !this.state.editing && !this.state.editable ? <button className="btn btn-success favourite" type="submit" onClick={this.handleSaveRecipe}><i className="fas fa-heart"></i> Favourite recipe</button> : null}
                  {this.props.isLoggedin && this.state.saved && !this.state.editing ? <button className="btn btn-secondary unfavourite" type="submit" onClick={this.handleUnsaveRecipe}><i className="fas fa-heart"></i> Unfavourite recipe</button> : null}
                  <div>
                    <a className="text-reset pl-1" style={{ fontSize: '150%' }} href={`https://twitter.com/intent/tweet?source=webclient&text=${this.state.name}+-+${this.state.description}+via+Recipease+-+https://recipease-ironhack.herokuapp.com${this.props.location.pathname}`} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                    <a className="text-reset pl-1" style={{ fontSize: '150%' }} href={`https://www.pinterest.com/pin/create/button/?url=https://recipease-ironhack.herokuapp.com${this.props.location.pathname}&media=${this.state.photoUrl}&description=${this.state.name}+-+${this.state.description}+via+Recipease`} target="_blank" rel="noopener noreferrer"><i className="fab fa-pinterest"></i></a>
                    <a className="text-reset pl-1" style={{ fontSize: '150%' }} href={`https://www.facebook.com/sharer/sharer.php?u=https://recipease-ironhack.herokuapp.com${this.props.location.pathname}&t=${this.state.name}+-+${this.state.description}+via+Recipease`} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                  </div>
                </div>
                {!this.state.editing ?
                  <>
                    <p>Duration: {this.state.duration} minutes</p>
                    <p>Servings: {this.state.servings}</p>
                    <h2>Ingredients</h2>
                    <ul className="list-unstyled">
                      {this.state.ingredients.map((item, index) => {
                        return (
                          <li key={index}><strong>{item.quantity}</strong> {item.name}</li>
                        )
                      })}
                    </ul>
                    <h2>Instructions</h2>
                    <ol className="px-3">
                      {this.state.instructions.map((item, index) => {
                        return (
                          <li key={index}>{item}</li>
                        )
                      })}
                    </ol>
                    <p className="card-text"><small className="text-muted">Last updated at {moment(this.state.updated_at).format("h:mma on Do MMMM YYYY")}</small></p>
                  </>
                  :
                  <form>
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input id="name" name="name" placeholder="Recipe name" type="text" required className="form-control" value={this.state.name} onChange={this.handleChange} autoComplete="off" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea id="description" name="description" cols="40" rows="5" aria-describedby="descriptionHelpBlock" required className="form-control" value={this.state.description} onChange={this.handleChange}></textarea>
                      <span id="descriptionHelpBlock" className="form-text text-muted">Provide a description of the recipe.</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="photo">Upload recipe photo</label>
                      <input type="file" className="form-control-file" id="photo" onChange={this.fileOnchange} />
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <label htmlFor="duration">Duration</label>
                        <input id="duration" name="duration" type="text" required className="form-control" value={this.state.duration} onChange={this.handleChange} autoComplete="off" />
                      </div>
                      <div className="col">
                        <label htmlFor="servings">Servings</label>
                        <input id="servings" name="servings" type="text" required className="form-control" value={this.state.servings} onChange={this.handleChange} autoComplete="off" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ingredients_1">Ingredients</label>
                      {
                        this.state.ingredients.map((ingredient, index) => {
                          return (
                            <div className="form-row" key={index}>
                              <div className="col col-md-9">
                                <input className="form-control" onChange={(e) => this.handleItemChange(e, index)} value={ingredient.name} name="name" autoComplete="off" />
                              </div>
                              <div className="col">
                                <input className="form-control" onChange={(e) => this.handleItemChange(e, index)} value={ingredient.quantity} name="quantity" autoComplete="off" />
                              </div>
                              <div className="col-auto">
                                <button className="btn btn-warning" onClick={(e) => this.handleItemRemove(e, index)}><i className="far fa-trash-alt"></i></button>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary" onClick={this.addItem}><i className="fas fa-plus"></i> Add ingredient</button>
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
                              <div className="col-auto">
                                <button className="btn btn-warning" onClick={(e) => this.handleInstructionRemove(e, index)}><i className="far fa-trash-alt"></i></button>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary" onClick={this.addInstruction}><i className="fas fa-plus"></i> Add instruction</button>
                    </div>
                    <div className="form-row">
                      <div className="col-auto">
                        <button type="submit" className="btn btn-danger" onClick={this.handleEditRecipe}>Cancel changes</button>
                      </div>
                      <div className="col-auto">
                        {disable ? <button name="submit" type="submit" className="btn btn-success" disabled><i className="fas fa-cloud-upload-alt"></i> Save changes</button> : <button name="submit" type="submit" className="btn btn-success" onClick={this.handleSubmit}><i className="fas fa-cloud-upload-alt"></i> Save changes</button>}
                      </div>
                    </div>
                  </form>
                }
              </div>
            </div>
          </div>
        </>
    );
  }
}

export default withAuth(RecipeDetail);