import { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import HeaderImage from './images/header_image.png';
import FacebookIcon from './images/facebook-40x40.jpg';
import LinkedInIcon from './images/linkedin-40x40.png';
import XIcon from './images/x-40x40.png';

import { get } from 'aws-amplify/api';

import {
    Routes, Route, Link, useLocation
} from "react-router-dom";
import { BuiltWith } from '@hypertext-craft/built-with';
import '@hypertext-craft/built-with/dist/style.css';

const SiteName = "Amplify React App";
const API_NAME = 'apirest1';

function App()
{
    const [backendPath, setBackendPath] = useState('');
    const [backendResponse, setBackendResponse] = useState(null);

    const fetchBackend = useCallback(async (path) => {
        const apiPath = `/${path}`;
        try {
            const restOperation = get({
              apiName: API_NAME,
              path: apiPath
            });
            const response = await restOperation.response;
            const body = await response.body.text();
            
            // The actual business logic data is often in the `body` property and may be a JSON string.
            // This safely parses it. If it's not a string, it returns the response as is.
            return body ? JSON.parse(body) : body;
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
                        <Col sm={9} className="header-col">
                            <Navbar className="header-brand">
                                <Navbar.Brand as={Link} to="/">
                                    <img
                                        alt="Amplify React App"
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
                        <Col sm={3} className="sidebar">
                            <Navbar>
                                <Nav>
                                    <ul>
                                        <li><Nav.Link as={Link} to="/">Home</Nav.Link></li>
                                        <li><Nav.Link as={Link} to="/about">About</Nav.Link></li>
                                        <li><Nav.Link as={Link} to="/pricing">Pricing</Nav.Link></li>
                                        <li><Nav.Link as={Link} to="/contact">Contact</Nav.Link></li>
                                    </ul>
                                </Nav>
                            </Navbar>
                        </Col>
                    </Row>
                    <Row className="content-row">
                        <Col sm>
                            <Routes>
                                <Route path="/" element={<HomeContent backendResponse={backendResponse} />} />
                                <Route path="/about" element={<AboutContent backendResponse={backendResponse} />} />
                                <Route path="/pricing" element={<PricingContent backendResponse={backendResponse} />} />
                                <Route path="/contact" element={<ContactContent backendResponse={backendResponse} />} />
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
            <p>Welcome to our website! We're glad you're here. Take a look around to learn more about what we do.</p>
        </>,
        backendResponse
    );
}

function AboutContent({ backendResponse })
{
    return Content(
        <>
            <h2>About Us</h2>
            <p>We are a company dedicated to providing the best services to our customers. Our team is passionate about technology and innovation.</p>
        </>,
        backendResponse
    );
}

function PricingContent({ backendResponse })
{
    return Content(
        <>
            <h2>Pricing</h2>
            <p>We offer a variety of plans to fit your needs. Please contact us for more information on our competitive pricing.</p>
        </>,
        backendResponse
    );
}

function ContactContent({ backendResponse })
{
    return Content(
        <>
            <h2>Contact Us</h2>
            <p>You can reach us by email at contact@example.com or by phone at 555-555-5555.</p>
        </>,
        backendResponse
    );
}

function Footer()
{
    return (
        <div className="footer">
            <Nav.Link as={Link} to="/">Home page for {SiteName}</Nav.Link>
            <div className="social-links">
                <a href="#facebook"><img src={FacebookIcon} alt="Visit our Facebook page" /></a>
                <a href="#x"><img src={XIcon} alt="Visit our X page" /></a>
                <a href="#linkedin"><img src={LinkedInIcon} alt="Visit our LinkedIn page" /></a>
            </div>
            <div className='established'>Established {new Date().getFullYear()}</div>
            <BuiltWith />
        </div>
    );
}

export default App;