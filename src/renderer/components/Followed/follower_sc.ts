import styled from 'styled-components';

type SCProps = {
    hoverShade: string;
};
export const StreamCard = styled.div<SCProps>`
    display: flex;
    padding: 5px 5px;
    cursor: pointer;
    width: 255px;

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
            font-size: 18px;
            font-weight: bold;
            color: #eee;
        }
        .playing {
            font-size: 14px;
        }
    }
`;
