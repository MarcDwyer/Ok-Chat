import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { TokenStore } from './stores/token_store';

import { Main } from './components/MainApp/main';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
const tokenStore = new TokenStore();

const render = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        mainElement
    );
};

render(() => <Main tokenStore={tokenStore} />);
