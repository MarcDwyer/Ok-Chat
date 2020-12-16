import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { TokenStore } from './stores/token_store';

import { Main } from './components/MainApp/main';
import { ThemeStore } from './stores/theme_store';

import './app.scss';
import { TwitchChat } from './stores/tc_store';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
const themeStore = new ThemeStore();
const tc = new TwitchChat();

const render = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        mainElement
    );
};

render(() => <Main themeStore={themeStore} tc={tc} />);
