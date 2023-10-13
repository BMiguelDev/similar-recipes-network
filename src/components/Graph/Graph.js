import React, { Component } from 'react';
import { Col } from 'reactstrap';
import { Sigma, RandomizeNodePositions, /* EdgeShapes, NodeShapes, RelativeSize */ } from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink';
import ForceAtlas2 from 'react-sigma/lib/ForceAtlas2';

export default class Graph extends Component {
    constructor(props) {
        super(props);

        this.displayGraph = this.displayGraph.bind(this);
    }

    displayGraph() {
        if (this.props.isGraphBuilt) {
            if (this.props.selectedLayout === 'Force Atlas 2') {
                return (
                    <Sigma className="sigma_graph" style={{ width: "100%", height: "100%", fontSize: "2rem" }} onClickNode={this.props.handleGraphNodeClick} graph={this.props.graphJson} settings={{ drawEdges: true, clone: false, defaultLabelColor: 'rgba(43, 144, 222, 0.975)' }}>
                        {/* <RelativeSize initialSize={1} /> */}
                        <RandomizeNodePositions />
                        <ForceAtlas2 easing="cubicInOut" gravity={2} edgeWeightInfluence={4} /* this attracts nodes connected with edges of positive weight*/ />
                    </Sigma>
                )
            }
            else if (this.props.selectedLayout === 'Force Link') {
                const angle = Math.PI / 3;
                return (
                    <Sigma className="sigma_graph" style={{ width: "100%", height: "100%" }} onClickNode={this.props.handleGraphNodeClick} graph={this.props.graphJson} settings={{ drawEdges: true, clone: false, defaultLabelColor: 'rgba(43, 144, 222, 0.975)' }}>
                        {/* <RelativeSize initialSize={1} /> */}
                        <RandomizeNodePositions />
                        <ForceLink nodeSiblingsAngleMin={angle} edgeWeightInfluence={2}/* this attracts nodes connected with edges of positive weight*/ />
                    </Sigma>
                )
            }
        } else if (this.props.isGraphLoading) {
            return (
                <div className="graph_loading_container">
                    <i className="fas fa-spinner fa-spin"></i>
                </div>
            )
        } else {
            return (
                <div className="empty_graph_container">
                    <i className="fa-regular fa-face-smile"></i>
                    <div className="empty_graph_container_description">
                        <h4>Search for a recipe and click it to build a network graph of similar recipes!</h4>
                        <p>
                            You can then drag to explore the graph and search each node.
                            Nodes are colored based on preparation time and sized based on number of servings.
                        </p>
                    </div>
                </div>
            )
        }
    }

    render() {
        return (
            <Col className="graph_container">
                { this.displayGraph() }
            </Col>
        );
    }
}