export declare function getAccounts(): Promise<{
    name: string;
    address: string;
    signers: {
        name: string;
        address: string;
    }[];
}[]>;
export default getAccounts;
