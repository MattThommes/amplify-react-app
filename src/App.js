import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import HeaderImage from './images/header_image.png';
import HeartIcon from './images/heart.svg';

import { API } from "aws-amplify";

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from "react-router-dom";

const SiteName = "Amplify React App";
const ApiName = process.env.REACT_APP_ENV_API_NAME;

function fetchBackend(path) {
    return API.get(ApiName, '/backend/' + path);
}

function App() {
    const [path, setPath] = useState('');
    const [backendResponse, setBackendResponse] = useState(null);

    useEffect(() => {
        if (ApiName !== '') {
            let ignore = false;
            setBackendResponse(null);
            fetchBackend(path).then(response => {
                if (!ignore) {
                    setBackendResponse(response);
                }
            });
            return () => {
                ignore = true;
            }
        }
    }, [path]);

    return (
        <div className="App">
            <Router>
                <Container>
                    <Row className="header-row">
                        <Col sm={8} className="header-col">
                            <Navbar className="header-brand">
                                <Navbar.Brand as={Link} to="/">
                                    <img
                                        alt=""
                                        src={HeaderImage}
                                        className="img-fluid"
                                    />{'  '}
                                </Navbar.Brand>
                            </Navbar>
                            <Container className="header-sub">
                                <Row>
                                    <Col>
                                        Welcome to the {SiteName} website!
                                        <br />
                                    </Col>
                                </Row>
                            </Container>
                        </Col>
                        <Col sm={4} className="sidebar">
                            <Navbar>
                                <Nav>
                                    <ul>
                                        <li><Nav.Link as={Link} to="/">Home</Nav.Link></li>
                                        <li><Nav.Link as={Link} to="/page-1">Page 1</Nav.Link></li>
                                        <li><Nav.Link as={Link} to="/page-2">Page 2</Nav.Link></li>
                                    </ul>
                                </Nav>
                            </Navbar>
                        </Col>
                    </Row>
                    <Row className="content-row">
                        <Col sm>
                            <Routes>
                                <Route path="/"       element={<HomeContent />} />
                                <Route path="/page-1" element={<Page1Content />} />
                                <Route path="/page-2" element={<Page2Content />} />
                            </Routes>
                        </Col>
                    </Row>
                    <Row className="footer-row">
                        <Col sm>
                            <Footer />
                        </Col>
                    </Row>
                </Container>
            </Router>
        </div>
    );
}

function Content(pageOutput) {
    return (
        <>
            <div className="content">
                {pageOutput}
            </div>
        </>
    );
}

function HomeContent() {
    return Content(
        <>
            <h2>Home</h2>
        </>
    );
}

function Page1Content() {
    return Content(
        <>
            <h2>Page 1</h2>
        </>
    );
}

function Page2Content() {
    return Content(
        <>
            <h2>Page 2</h2>
        </>
    );
}

function BuiltWith() {
    return (
        <>
            <div className="built-with">
                Website hand-crafted with <img src={HeartIcon} width="20" alt="" /> using
                &nbsp;<a href="https://github.com/MattThommes/amplify-react-app">Amplify React App</a>
            </div>
        </>
    );
}

function Footer() {
    return (
        <div className="footer">
            <Nav.Link as={Link} to="/">The {SiteName} website</Nav.Link>
            <div className='established'>Established {new Date().getFullYear()}</div>
            <BuiltWith />
        </div>
    );
}

export default App;
