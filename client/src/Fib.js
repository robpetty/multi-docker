import React, { Component } from 'react';

// axios used to make calles to express app serer
import axios from 'axios';

class Fib extends Component {
    // create the status object
    state = {
      seenIndexes: [],
      values: {},
      index: ''  
    };

    // once component rendered, this lifecycle function fires
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');

        this.setState({
            values:values.data
        });
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');

        this.setState({
            seenIndexes:seenIndexes.data
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        await axios.post('/api/values', {
            index:this.state.index
        });

        // clear input after submitting
        this.setState({
            index: ''
        });
    };

    // loop over array of objects from postgres, pull out the number, build string
    renderSeenIndexes() {
        return this.state.seenIndexes.map(({number}) => 
            number
        ).join(', ');
    }

    // loop over object from redis.
    // iteration on this object is different then the object array from postgres.
    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calcluated {this.state.values[key]}
                </div>
            )
        }

        return entries;
    }

    // now render to the browser
    // return JSX
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Enter your index:
                    </label>
                    <input 
                        value={this.state.index}
                        onChange={
                            (event) => this.setState({ index: event.target.value})
                        }
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {
                    this.renderSeenIndexes()
                }

                <h3>Calculated Values:</h3>
                {
                    this.renderValues()
                }
            </div>
        );
    }
}

// make available to App.js
export default Fib;