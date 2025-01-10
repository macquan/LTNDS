/**
 *
 * Navigation
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Link, NavLink as ActiveLink, withRouter } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import actions from '../../actions';

import Button from '../../components/Common/Button';
import CartIcon from '../../components/Common/CartIcon';
import { BarsIcon } from '../../components/Common/Icon';
import MiniBrand from '../../components/Store//MiniBrand';
import Menu from '../NavigationMenu';
import Cart from '../Cart';
import Sketchpad from '../Sketchpad';

import { searchByImage } from '../Homepage/imageSearch';
import './SearchResults.css';

class Navigation extends React.PureComponent {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      loading: false,
      results: [], // Store search results
      sketchMode: false, // Whether the sketchpad is open
      sketchImage: null // Store the sketch image
    };
  }
  componentDidMount() {
    this.props.fetchStoreBrands();
    this.props.fetchStoreCategories();
  }

  toggleBrand() {
    this.props.fetchStoreBrands();
    this.props.toggleBrand();
  }

  toggleMenu() {
    this.props.fetchStoreCategories();
    this.props.toggleMenu();
  }

  handleSketchSearch = async () => {
    if (!this.state.sketchImage) {
      alert('Please draw something before searching!');
      return;
    }

    this.setState({ loading: true, results: [] });

    try {
      // Convert data URL to a Blob to simulate a file input for `searchByImage`
      const dataUrl = this.state.sketchImage;
      const blob = await fetch(dataUrl).then(res => res.blob());
      const file = new File([blob], 'sketch.png', { type: 'image/png' });

      // Use the existing image search function
      const results = await searchByImage(file);
      console.log('Sketch Search Results:', results);

      this.setState({ results });
    } catch (error) {
      console.error('Error during sketch search:', error);
    } finally {
      this.setState({ loading: false, sketchMode: false }); // Close sketchpad
    }
  };

  handleSketchpadSave = sketchDataUrl => {
    this.setState({ sketchImage: sketchDataUrl });
    alert("Sketch saved! Click 'Search by Sketch' to find results.");
  };

  handleFileUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    this.setState({ loading: true, results: [] }); // Show loading and clear previous results

    try {
      const matches = await searchByImage(file); // Perform image search
      console.log('Image Search Results:', matches);

      // Update results in the component state
      this.setState({ results: matches });
    } catch (error) {
      console.error('Error during image search:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  getSuggestionValue(suggestion) {
    return suggestion.name;
  }

  renderSuggestion(suggestion, { query, isHighlighted }) {
    const BoldName = (suggestion, query) => {
      const matches = AutosuggestHighlightMatch(suggestion.name, query);
      const parts = AutosuggestHighlightParse(suggestion.name, matches);

      return (
        <div>
          {parts.map((part, index) => {
            const className = part.highlight
              ? 'react-autosuggest__suggestion-match'
              : null;
            return (
              <span className={className} key={index}>
                {part.text}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <Link to={`/product/${suggestion.slug}`}>
        <div className='d-flex'>
          <img
            className='item-image'
            src={`${suggestion.imageUrl
              ? suggestion.imageUrl
              : '/images/placeholder-image.png'
              }`}
          />
          <div>
            <Container>
              <Row>
                <Col>
                  <span className='name'>{BoldName(suggestion, query)}</span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span className='price'>${suggestion.price}</span>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </Link>
    );
  }

  render() {
    const {
      history,
      authenticated,
      user,
      cartItems,
      brands,
      categories,
      signOut,
      isMenuOpen,
      isCartOpen,
      isBrandOpen,
      toggleCart,
      toggleMenu,
      searchValue,
      suggestions,
      onSearch,
      onSuggestionsFetchRequested,
      onSuggestionsClearRequested
    } = this.props;
    const { loading, results, sketchMode } = this.state;

    const inputProps = {
      placeholder: 'Search Products',
      value: searchValue,
      onChange: (_, { newValue }) => {
        onSearch(newValue);
      }
    };

    return (
      <header className='header fixed-mobile-header'>
        <div className='header-info'>
          <Container>
            <Row>
              <Col md='4' className='text-center d-none d-md-block'>
                <i className='fa fa-truck' />
                <span>Free Shipping</span>
              </Col>
              <Col md='4' className='text-center d-none d-md-block'>
                <i className='fa fa-credit-card' />
                <span>Payment Methods</span>
              </Col>
              <Col md='4' className='text-center d-none d-md-block'>
                <i className='fa fa-phone' />
                <span>Call us 951-999-9999</span>
              </Col>
              <Col xs='12' className='text-center d-block d-md-none'>
                <i className='fa fa-phone' />
                <span> Need advice? Call us 951-999-9999</span>
              </Col>
            </Row>
          </Container>
        </div>
        <Container>
          <Row className='align-items-center top-header'>
            <Col
              xs={{ size: 12, order: 1 }}
              sm={{ size: 12, order: 1 }}
              md={{ size: 3, order: 1 }}
              lg={{ size: 3, order: 1 }}
              className='pr-0'
            >
              <div className='brand'>
                {categories && categories.length > 0 && (
                  <Button
                    borderless
                    variant='empty'
                    className='d-none d-md-block'
                    ariaLabel='open the menu'
                    icon={<BarsIcon />}
                    onClick={() => this.toggleMenu()}
                  />
                )}
                <Link to='/'>
                  <h1 className='logo'>MERNo Store</h1>
                </Link>
              </div>
            </Col>
            <Col
              xs={{ size: 12, order: 4 }}
              sm={{ size: 12, order: 4 }}
              md={{ size: 12, order: 4 }}
              lg={{ size: 5, order: 2 }}
              className='pt-2 pt-lg-0'
            >
              <div className='search-container d-flex align-items-center'>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  getSuggestionValue={this.getSuggestionValue}
                  renderSuggestion={this.renderSuggestion}
                  inputProps={{
                    placeholder: 'Search Products',
                    value: searchValue,
                    onChange: (_, { newValue }) => onSearch(newValue)
                  }}
                  onSuggestionSelected={(_, item) => {
                    history.push(`/product/${item.suggestion.slug}`);
                  }}
                />

                {/* Image Search Button */}
                {/* <button
                  className='btn btn-outline-secondary ml-2'
                  onClick={() => this.fileInputRef.current.click()}
                  aria-label='Search with Image'
                >
                  <i className='fa fa-camera' />
                </button>
                <input
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  ref={this.fileInputRef}
                  onChange={this.handleFileUpload}
                /> */}

                {/* Voice Search Button */}
                {/* <button
                  className='btn btn-outline-secondary ml-2'
                  onClick={this.handleVoiceSearch}
                  aria-label='Search with Voice'
                >
                  <i className='fa fa-microphone' />
                </button> */}

                {/* Sketch Search Button */}
                <button
                  className='btn btn-outline-secondary ml-2'
                  onClick={() => this.setState({ sketchMode: true })}
                  aria-label='Search by Sketch'
                >
                  <i className='fa fa-pencil' />
                </button>

                {/* Sketchpad Modal */}
                {sketchMode && (
                  <div className='sketchpad-modal'>
                    <h3>Draw Your Design</h3>
                    <Sketchpad onSave={this.handleSketchpadSave} />
                    <button
                      className='btn btn-primary'
                      onClick={this.handleSketchSearch}
                    >
                      Search by Sketch
                    </button>
                    <button
                      className='btn btn-secondary'
                      onClick={() => this.setState({ sketchMode: false })}
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* Camera Button */}
                <button
                  className='btn btn-outline-secondary ml-2'
                  onClick={() => this.fileInputRef.current.click()}
                  aria-label='Search with Image'
                >
                  <i className='fa fa-camera' />
                </button>
                <input
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  ref={this.fileInputRef}
                  onChange={this.handleFileUpload}
                />

                {loading && (
                  <div className='spinner-border text-primary' role='status'>
                    <span className='sr-only'>Loading...</span>
                  </div>
                )}

                {/* Results Section */}
                {/* {results.length > 0 && (
                  <div className='search-results'>
                    <h4>Matching Products:</h4>
                    <ul>
                      {results.map(product => (
                        <li key={product.slug}>
                          <a href={`/product/${product.slug}`}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '50px',
                                marginRight: '10px',
                                verticalAlign: 'middle'
                              }}
                            />
                            {product.name}
                          </a>
                        </li>
                      ))}
                    </ul>{' '}
                  </div>
                )} */}
                {/* Display Results Below */}
                {results.length > 0 && (
                  <div className='search-results-dropdown'>
                    <ul>
                      {results.map(product => (
                        <li key={product.slug}>
                          <a
                            href={`/product/${product.slug}`}
                            className='dropdown-item'
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '40px',
                                marginRight: '10px',
                                verticalAlign: 'middle'
                              }}
                            />
                            {product.name} - ${product.price}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Col>

            <Col
              xs={{ size: 12, order: 2 }}
              sm={{ size: 12, order: 2 }}
              md={{ size: 4, order: 1 }}
              lg={{ size: 5, order: 3 }}
              className='desktop-hidden'
            >
              <div className='header-links'>
                <Button
                  borderless
                  variant='empty'
                  ariaLabel='open the menu'
                  icon={<BarsIcon />}
                  onClick={() => this.toggleMenu()}
                />
                <CartIcon cartItems={cartItems} onClick={toggleCart} />
              </div>
            </Col>
            <Col
              xs={{ size: 12, order: 2 }}
              sm={{ size: 12, order: 2 }}
              md={{ size: 9, order: 1 }}
              lg={{ size: 4, order: 3 }}
            // className='px-0'
            >
              <Navbar color='light' light expand='md' className='mt-1 mt-md-0'>
                <CartIcon
                  className='d-none d-md-block'
                  cartItems={cartItems}
                  onClick={toggleCart}
                />
                <Nav navbar>
                  {brands && brands.length > 0 && (
                    <Dropdown
                      nav
                      inNavbar
                      toggle={() => this.toggleBrand()}
                      isOpen={isBrandOpen}
                    >
                      <DropdownToggle nav>
                        Brands
                        <span className='fa fa-chevron-down dropdown-caret'></span>
                      </DropdownToggle>
                      <DropdownMenu right className='nav-brand-dropdown'>
                        <div className='mini-brand'>
                          <MiniBrand
                            brands={brands}
                            toggleBrand={() => this.toggleBrand()}
                          />
                        </div>
                      </DropdownMenu>
                    </Dropdown>
                  )}
                  <NavItem>
                    <NavLink
                      tag={ActiveLink}
                      to='/shop'
                      activeClassName='active'
                    >
                      Shop
                    </NavLink>
                  </NavItem>
                  {authenticated ? (
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav>
                        {user.firstName ? user.firstName : 'Welcome'}
                        <span className='fa fa-chevron-down dropdown-caret'></span>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem
                          onClick={() => history.push('/dashboard')}
                        >
                          Dashboard
                        </DropdownItem>
                        <DropdownItem onClick={signOut}>Sign Out</DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  ) : (
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav>
                        Welcome!
                        <span className='fa fa-chevron-down dropdown-caret'></span>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem onClick={() => history.push('/login')}>
                          Login
                        </DropdownItem>
                        <DropdownItem onClick={() => history.push('/register')}>
                          Sign Up
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  )}
                </Nav>
              </Navbar>
            </Col>
          </Row>
        </Container>

        {/* hidden cart drawer */}
        <div
          className={isCartOpen ? 'mini-cart-open' : 'hidden-mini-cart'}
          aria-hidden={`${isCartOpen ? false : true}`}
        >
          <div className='mini-cart'>
            <Cart />
          </div>
          <div
            className={
              isCartOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'
            }
            onClick={toggleCart}
          />
        </div>

        {/* hidden menu drawer */}
        <div
          className={isMenuOpen ? 'mini-menu-open' : 'hidden-mini-menu'}
          aria-hidden={`${isMenuOpen ? false : true}`}
        >
          <div className='mini-menu'>
            <Menu />
          </div>
          <div
            className={
              isMenuOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'
            }
            onClick={toggleMenu}
          />
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => {
  return {
    isMenuOpen: state.navigation.isMenuOpen,
    isCartOpen: state.navigation.isCartOpen,
    isBrandOpen: state.navigation.isBrandOpen,
    cartItems: state.cart.cartItems,
    brands: state.brand.storeBrands,
    categories: state.category.storeCategories,
    authenticated: state.authentication.authenticated,
    user: state.account.user,
    searchValue: state.navigation.searchValue,
    suggestions: state.navigation.searchSuggestions
  };
};

export default connect(mapStateToProps, actions)(withRouter(Navigation));
