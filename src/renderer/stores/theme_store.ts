export type ThemeData = {
    backgroundColor: string;
    color: string;
    shadeOne: string;
    shadeTwo: string;
    border: string;
};
export class ThemeStore {
    themeData: ThemeData = {
        backgroundColor: 'rgb(21, 25, 28)',
        color: 'rgb(180, 186, 194)',
        border: 'rgb(61, 85, 209)',
        shadeOne: 'rgb(35, 38, 43)',
        shadeTwo: '#383B40'
    };
}
