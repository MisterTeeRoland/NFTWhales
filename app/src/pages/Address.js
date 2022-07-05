import React from "react";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { allCollections } from "../collectionsFile";
import { Blockie, Tooltip, Icon } from "web3uikit";
import { useMoralisWeb3Api, useMoralis } from "react-moralis";
import axios from "axios";

function Address() {
    const [txs, setTxs] = useState();
    const [collectionData, setCollectionData] = useState();
    const [colNfts, setColNfts] = useState([]);
    const { address, collection } = useParams();
    const Web3Api = useMoralisWeb3Api();
    const { isInitialized } = useMoralis();
    const navigate = useNavigate();

    const clickHandler = (addrs) => {
        navigate(`/${collection}/${addrs}`);
    };

    useEffect(() => {
        const result = allCollections.filter((obj) => {
            return obj.slug === collection;
        });

        setCollectionData(result[0]);

        async function searchAccount() {
            const res = await axios.get("http://localhost:4001/user", {
                params: { slug: collection, address },
            });
            const data = res.data;
            setTxs(data);
        }

        searchAccount();

        async function fetchUserCol() {
            const options = {
                address,
                token_address: collection,
            };
            const NFTs = await Web3Api.account.getNFTsForContract(options);
            setColNfts(NFTs.result);
        }

        if (isInitialized) {
            fetchUserCol();
        }
    }, [collection, address]);

    const columns = [
        {
            title: "Event",
            dataIndex: "from",
            render: (from) => {
                if (from === "0x0000000000000000000000000000000000000000") {
                    return (
                        <div className="App">
                            <Icon svg="stars" fill="#fff" />
                            Mint
                        </div>
                    );
                } else if (from === address) {
                    return (
                        <div className="App">
                            <Icon svg="speedyNode" fill="#fff" />
                            Sell
                        </div>
                    );
                } else {
                    return (
                        <div className="App">
                            <Icon svg="cart" fill="#fff" />
                            Buy
                        </div>
                    );
                }
            },
        },
        {
            title: "Token ID",
            dataIndex: "tokenId",
        },
        {
            title: "Price",
            dataIndex: "price",
            render: (price) => {
                return (
                    <div style={{ display: "flex" }}>
                        <Icon svg="eth" fill="#fff" />
                        {(Number(price) / 1e18).toFixed(2)}
                    </div>
                );
            },
        },
        {
            title: "Date",
            dataIndex: "date",
            render: (date) => {
                let ms = new Date(date).getTime();
                let today = new Date().getTime();

                let diff = Math.floor((today - ms) / 86400000);

                return <div>{diff} days ago</div>;
            },
        },
        {
            title: "To",
            dataIndex: "to",
            render: (to) => {
                return (
                    <a onClick={() => clickHandler(to)}>{`${to.slice(
                        0,
                        6
                    )}...${to.slice(-4)}`}</a>
                );
            },
        },
        {
            title: "From",
            dataIndex: "from",
            render: (from) => {
                return (
                    <a onClick={() => clickHandler(from)}>{`${from.slice(
                        0,
                        6
                    )}...${from.slice(-4)}`}</a>
                );
            },
        },
    ];

    return (
        <>
            {collectionData && (
                <div className="userTitle">
                    <div>
                        <img
                            src={collectionData.img}
                            alt="colLogo"
                            className="logoImg"
                        />
                        {collectionData.name}
                    </div>
                    <div className="wallet">
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        <Blockie seed={address} />
                    </div>
                </div>
            )}

            {colNfts && (
                <div className="imgList">
                    <div>User Collection</div>
                    <div className="theImgs">
                        {colNfts.map((e, i) => {
                            return (
                                <div key={i}>
                                    <Tooltip content={e.token_id}>
                                        <img
                                            src={JSON.parse(e.metadata).image}
                                            className="colNfts"
                                        />
                                    </Tooltip>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="App">
                <div className="tableContainer">
                    <Table columns={columns} dataSource={txs} />
                </div>
            </div>
        </>
    );
}

export default Address;
