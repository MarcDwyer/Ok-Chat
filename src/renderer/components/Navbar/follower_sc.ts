import styled from 'styled-components';

type SCProps = {
    hoverShade: string;
};
export const StreamCard = styled.div<SCProps>`
    display: flex;
    padding: 5px 5px;
    cursor: pointer;
    width: 95%;
    margin-left: auto;
    margin-right: auto;

    &:hover {
        background-color: ${p => p.hoverShade};
    }

    img {
        margin-right: 10px;
        border-radius: 50%;
        height: 35px;
        width: 35px;
    }

    .details {
        display: flex;
        flex-direction: column;

        .name {
            font-size: 16px;
            font-weight: bold;
            color: #eee;
        }
        .playing {
            font-size: 14px;
        }
    }
`;
