import { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import HeaderImage from './images/header_image.png';
import HeartIcon from './images/heart.svg';

import { API } from 'aws-amplify';

import {
    Routes, Route, Link, useLocation
} from "react-router-dom";

const SiteName = "Amplify React App";
const API_NAME = 'apirest1';

function App()
{
    const [backendPath, setBackendPath] = useState('');
    const [backendResponse, setBackendResponse] = useState(null);

    const fetchBackend = useCallback(async (path) => {
        const apiPath = `/${path}`;
        try {
            const response = await API.get(API_NAME, apiPath, {});
            // The actual business logic data is often in the `body` property and may be a JSON string.
            // This safely parses it. If it's not a string, it returns the response as is.
            return typeof response === 'string' ? JSON.parse(response) : response;
        } catch (error) {
            console.error("API call failed:", error);
            return { error: 'Failed to fetch data from the backend.' };
        }
    }, []);

    // Get URL path from React Router and call backend API
    let location = useLocation();
    useEffect(() => {
        setBackendPath(location.pathname.replace(/^\/+/, ''));
    }, [location]);

    useEffect(() => {
        let ignore = false;
        setBackendResponse(null);
        fetchBackend(backendPath).then((response) => {
            if (!ignore) {
                setBackendResponse(response);
            }
        });
        return () => {
            ignore = true;
        }
    }, [backendPath, fetchBackend]);

    // Monitor backend response changes
    useEffect(() => {
        if (backendResponse !== null) {
            console.log('Backend response: ' + JSON.stringify(backendResponse));
        }
    }, [backendResponse]);

    return (
        <div className="App">
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
                                <Route path="/"       element={<HomeContent backendResponse={backendResponse} />} />
                                <Route path="/page-1" element={<Page1Content backendResponse={backendResponse} />} />
                                <Route path="/page-2" element={<Page2Content backendResponse={backendResponse} />} />
                            </Routes>
                        </Col>
                    </Row>
                    <Row className="footer-row">
                        <Col sm>
                            <Footer />
                        </Col>
                    </Row>
                </Container>
        </div>
    );
}

function Content(pageOutput, backendResponse)
{
    return (
        <>
            <div className="content">
                {pageOutput}
                {backendResponse && backendResponse.message && <p>{backendResponse.message}</p>}
            </div>
        </>
    );
}

function HomeContent({ backendResponse })
{
    return Content(
        <>
            <h2>Home</h2>
        </>,
        backendResponse
    );
}

function Page1Content({ backendResponse })
{
    return Content(
        <>
            <h2>Page 1</h2>
        </>,
        backendResponse
    );
}

function Page2Content({ backendResponse })
{
    return Content(
        <>
            <h2>Page 2</h2>
        </>,
        backendResponse
    );
}

function BuiltWith()
{
    return (
        <>
            <div className="built-with">
                Website hand-crafted with <img src={HeartIcon} width="20" alt="" /> using
                &nbsp;<a href="https://github.com/MattThommes/amplify-react-app">Amplify React App</a>
            </div>
        </>
    );
}

function Footer()
{
    return (
        <div className="footer">
            <Nav.Link as={Link} to="/">The {SiteName} website</Nav.Link>
            <div className='established'>Established {new Date().getFullYear()}</div>
            <BuiltWith />
        </div>
    );
}

export default App;
