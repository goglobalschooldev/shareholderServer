const { mongoose } = require("mongoose");
const Share = require("../models/Share");
const SoldOutShare = require("../models/SoldOutShare");
const Shareholder = require("../models/Shareholder");
const Property = require('../models/Property');
const { GetFirstInvoice_ID, Get_Start_ID } = require('../../util/ShareCaculattor');

module.exports = {
    Query: {
        getShareById: async (__, args) => {
            try {
                const share = await Share.findById(args._id).populate('property').exec();

                if (share)
                    return {
                        message: "Get Share Succes!",
                        status: true,
                        data: share
                    }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        getSharesProperty: async (__, args) => {
            try {
                const shares = await Share.find({
                    property: mongoose.Types.ObjectId(args.property_Id)
                })

                if (shares)
                    return {
                        message: "Get Share Succese!",
                        status: true,
                        data: shares
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false,
                    data: null
                }
            }
        },
        getSharesSoldByShareholder: async (__, args) => {
            const { property_Id, shareholder_Id } = args;
            try {
                const shareSold = await SoldOutShare.find({
                    shareholder: shareholder_Id,
                    property: property_Id,
                }).populate('shareholder').populate('property').populate('share').exec();
                if (shareSold) {
                    return {
                        message: "Get Share Success!",
                        status: true,
                        data: shareSold
                    }
                } else {
                    return {
                        message: "Cannot Get Share Success!",
                        status: false,
                        data: null
                    }
                }


            } catch (error) {
                return {
                    message: error.message,
                    status: false,
                    data: null
                }
            }
        },
        getShareholderOwnership: async (__, args) => {
            const { property_Id, shareholder_Id } = args;
            // console.log(property_Id, shareholder_Id)
            let getShare = [];

            try {
                const getunitPrice = await SoldOutShare.findOne({
                    shareholder: mongoose.Types.ObjectId(shareholder_Id),
                    property: mongoose.Types.ObjectId(property_Id),
                    status: false
                }).populate('shareholder').populate('property').populate('share').exec();
                const unitPrice = getunitPrice.share.unitPrice;

                const shareSold = await SoldOutShare.find({
                    shareholder: mongoose.Types.ObjectId(shareholder_Id),
                    property: mongoose.Types.ObjectId(property_Id),
                    status: false
                }).populate('shareholder').populate('property').populate('share').exec();
                const property = await Property.findById(property_Id).exec()
                const capital = property.capital
                const amountShare = capital * unitPrice;
                shareSold.forEach(doc => {
                    getShare.push(doc.share_Value)
                })
                const initialValue = 0;
                const shareTotal = getShare.reduce(
                    (previousValue, currentValue) => previousValue + currentValue,
                    initialValue
                );

                const ownderShip = (shareTotal / amountShare) * 100;
                // console.log("unit price :", unitPrice)
                // console.log(ownderShip)
                // console.log("capital:", capital)
                if (ownderShip) {
                    return {
                        message: "Get Ownership Success!",
                        status: true,
                        value: Math.round((ownderShip + Number.EPSILON) * 100) / 100
                    }
                }
            } catch (error) {
                return {
                    message: error.message,
                    status: false,
                    value: null
                }
            }
        }

    },
    Mutation: {
        createSellingShare: async (__, args) => {
            const { property, type, total, unitPrice, sale_Anountment, start_Sale_At, end_Sale_At } = args.input;
            let from = new Date(start_Sale_At)
            let to = new Date(end_Sale_At)
            let today = new Date();

            try {
                if (to < today)
                    return {
                        message: 'Closing Date must Biger Today!',
                        status: false
                    }
                if (from >= to)
                    return {
                        message: "Closing Date Must Small Then Start Date!",
                        status: false
                    }

                const findUnClosing = await Share.findOne({
                    property: mongoose.Types.ObjectId(property),
                    status: false,
                    closing: false
                })
                if (findUnClosing)
                    return {
                        message: "You Need To Closs Other Sell!",
                        status: false
                    }
                const duplicateAnnouncing = await Share.find({
                    property: mongoose.Types.ObjectId(property),
                    status: false,
                    sale_Anountment: sale_Anountment
                })
                // console.log(duplicateAnnouncing)
                if (duplicateAnnouncing.length != 0)
                    return {
                        message: "Share Announcing is Duplicate",
                        status: false
                    }
                const findProperty = await Property.findById(property).exec();

                if (!findProperty)
                    return {
                        message: "Cannot Find Property!",
                        status: false
                    }

                const share = await new Share({
                    property, type, total, unitPrice,
                    sale_Anountment,
                    start_Sale_At: new Date(start_Sale_At).toISOString(),
                    end_Sale_At: new Date(end_Sale_At).toISOString(),
                    status: false
                }).save();
                if (share)
                    return {
                        message: "Share Created!",
                        status: true
                    }

            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        expirationDateSellingShare: async (__, args) => {
            const { property_Id } = args;

            let today = new Date();
            let year = today.getFullYear();
            let month = today.getMonth() + 1;
            let dt = today.getDate();
            if (dt < 10) {
                dt = '0' + dt;
            }
            if (month < 10) {
                month = '0' + month;
            }

            try {
                const getExpdate = await Share.findOne({
                    end_Sale_At: year + '-' + month + '-' + dt,
                    property: property_Id,
                    status: false
                }).exec()
                // console.log(getExpdate._id.toString())
                if (getExpdate)
                    await Share.findByIdAndUpdate(
                        getExpdate._id.toString()
                        ,
                        {
                            closing: true
                        }
                    ).exec()

                // console.log(getExpdate)
                if (getExpdate)
                    return {
                        message: "Sell Anouncing Is Expired!",
                        status: true
                    }
                if (!getExpdate)
                    return {
                        message: "Cannot find share to check Expired!",
                        status: false
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }

        },
        closingSellingShare: async (__, args) => {

            const { property_Id, share_id, date } = args;
            let closeDate = new Date(date)
            let today = new Date();
            let year = today.getFullYear();
            let month = today.getMonth() + 1;
            let dt = today.getDate();
            if (dt < 10) {
                dt = '0' + dt;
            }
            if (month < 10) {
                month = '0' + month;
            }
            let getDate = year + '-' + month + '-' + dt;
            let finalDatre = new Date(getDate)
            try {
                // console.log(finalDatre, closeDate)
                // console.log(finalDatre.toString() === closeDate.toString())
                const findShare = await Share.findById(share_id).exec()

                if (closeDate < finalDatre)
                    return {
                        message: "Closing Date Must Bigger then Today!",
                        status: false
                    }

                if (finalDatre.toString() === closeDate.toString() && findShare) {
                    await Share.findByIdAndUpdate(
                        share_id,
                        {
                            end_Sale_At: closeDate,
                            closing: true
                        }
                    ).exec();
                } else {
                    await Share.findByIdAndUpdate(
                        share_id,
                        {
                            end_Sale_At: closeDate,
                        }
                    ).exec()
                }

                if (findShare)
                    return {
                        message: "Sell Anouncing Is Closing!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        shareVoiding: async (__, args) => {
            try {
                const share = await Share.findByIdAndUpdate(
                    args.share_Id,
                    {
                        status: true,
                        closing: true
                    }
                ).exec();
                if (share) {
                    return {
                        message: "Voiding Success!",
                        status: true
                    }
                }
                else {
                    return {
                        message: "Cannot Find Share!",
                        status: false
                    }
                }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        buyingShare: async (__, args) => {
            const { property_Id, shareholder_Id, share_Value } = args.input;
            const SoldShareVal = [];
            try {
                const property = await Property.findById(property_Id).exec();
                const shareholder = await Shareholder.findById(shareholder_Id).exec();
                const checkSelling = await Share.findOne({ property: property_Id, closing: false }).exec();
                const findShare = await Share.findOne({ property: property_Id, status: false }).exec();
                if (!property)
                    return {
                        status: false,
                        message: "Cannot find property to buy share!"
                    }
                if (!shareholder)
                    return {
                        status: false,
                        message: "Cannot find shareholder!"
                    }
                if (!findShare)
                    return {
                        status: false,
                        message: 'Cannot Find Share!'
                    }
                if (!checkSelling)
                    return {
                        status: false,
                        message: `${property.name} not selling share yet!`
                    }
                // find share sold out 
                const shareSoldOut = await SoldOutShare.find({ property: property_Id, status: false }).exec();
                const sortShareSoldOut = await SoldOutShare.find({ property: property_Id, status: false }).sort({ end_Id: -1 }).limit(1).exec();
                shareSoldOut.forEach(val => SoldShareVal.push(val.share_Value));

                const initialValue = 0;
                const countShareValuSold = SoldShareVal.reduce(
                    (previousValue, currentValue) => previousValue + currentValue,
                    initialValue
                );
                const invoice_Id = GetFirstInvoice_ID(shareSoldOut.length);
                const shareId = Get_Start_ID(shareSoldOut.length, sortShareSoldOut, share_Value);

                const remainShare = findShare.total - countShareValuSold
                if (share_Value > remainShare)
                    return {
                        status: false,
                        message: `${property.name} don't have enough share for selling with ${share_Value}. You can buy less than or equal: ${remainShare} !`
                    }
                const shareSelling = await new SoldOutShare({
                    invoice_Id: invoice_Id,
                    share_Value: share_Value,
                    price: share_Value * checkSelling.unitPrice,
                    start_Id: shareId.start,
                    end_Id: shareId.end,
                    shareholder: mongoose.Types.ObjectId(shareholder_Id),
                    property: mongoose.Types.ObjectId(property_Id),
                    share: checkSelling._id,
                    status: false
                }).save();
                if (shareSelling)
                    return {
                        message: 'Buy share success!',
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false,
                }
            }
        },
        SoldOutShareVoiding: async (__, args) => {
            try {
                const share = await SoldOutShare.findByIdAndUpdate(
                    args.share_Id,
                    {
                        status: true,
                    }
                ).exec();
                if (share)
                    return {
                        message: "Voiding success!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
    }
}