const User = require('../models/User');
const Shareholder = require('../models/Shareholder');
const SoldOutShare = require("../models/SoldOutShare");
const { authCheck } = require("../../helpers/auth");
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { auth } = require("../../config/firebaseConfig");
const shareholderLabels = {
    docs: "data",
    limit: "perPage",
    nextPage: "next",
    prevPage: "prev",
    meta: "paginator",
    page: "currentPage",
    pagingCounter: "slNo",
    totalDocs: "totalDocs",
    totalPages: "totalPages",
};
module.exports = {
    Query: {
        getSherholder: async (__, args) => {
            try {
                const shareholder = await Shareholder.findById(args.shareholder_Id).exec();
                if (shareholder)
                    return {
                        status: true,
                        message: "Get user seccess!",
                        data: shareholder
                    }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        getShareholderbyProperty: async (__, args) => {
            try {
                const shareholders = await Shareholder.find({
                    properties: mongoose.Types.ObjectId(args.property_Id)
                }).exec()

                if (shareholders)
                    return {
                        status: true,
                        message: "Get shareholder success!",
                        data: shareholders
                    }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        getShareholderWithPagination: async (__, args) => {
            const options = {
                page: args.page || 1,
                limit: args.limit || 10,
                customLabels: shareholderLabels,
                sort: {
                    createdAt: -1,
                },
                // populate: "",
            }

            let propertiesQuery = {}
            if(args.property_Id!==""){
                propertiesQuery={ properties: { $elemMatch: { $eq: mongoose.Types.ObjectId(args.property_Id) } } }
            }

            const query = {
                $and: [
                    { first_Name: { $regex: args.keyword, $options: "i" } },
                    { last_Name: { $regex: args.keyword, $options: "i" } },
                    propertiesQuery
                ],
            }
            const shareholders = await Shareholder.paginate(query, options);
            return shareholders;

        }
    },
    Mutation: {
        createShareholder: async (__, args) => {
            const { first_Name, last_Name, gender, place_of_Birth, national_Id, image_src, image_name, contact } = args.input;
            const uuid = mongoose.Types.ObjectId();
            try {

                if (!last_Name || !first_Name)
                    return {
                        status: false,
                        data: null,
                        message: "First Name and Last Name is required"
                    }

                if (!contact.mail)
                    return {
                        status: false,
                        data: null,
                        message: "Mail is required"
                    }
                if (!contact.password)
                    return {
                        status: false,
                        data: null,
                        message: "Password is required"
                    }
                if (contact.password.length < 8)
                    return {
                        status: false,
                        data: null,
                        message: "The password must be a string with at least 8 characters!"
                    }
                const findShareHolder = await Shareholder.findOne({ "contact.mail": contact.mail });
                const findUser = await User.findOne({ mail: contact.mail });
                if (findUser)
                    return {
                        status: false,
                        data: null,
                        message: `This mail: ${contact.mail} has been use by other user!`
                    }
                if (findShareHolder)
                    return {
                        status: false,
                        data: null,
                        message: `This mail: ${contact.mail} has been use by other shareholder!`
                    }
                const shareholder = await new Shareholder({
                    first_Name,
                    last_Name,
                    gender,
                    place_of_Birth,
                    national_Id,
                    image_src,
                    image_name,
                    position: "shareholder",
                    _id: uuid.toString(),
                    contact: contact,
                    create_At: new Date().toISOString()
                }).save();
                if (shareholder)
                    await auth
                        .createUser({
                            uid: uuid.toString(),
                            email: contact.mail,
                            password: contact.password,
                        })
                        .catch((error) => {
                            console.log('Error creating new user:', error);
                        });
                if (shareholder)
                    return {
                        status: true,
                        data: shareholder,
                        message: "Shareholder Created!"
                    }

            } catch (error) {
                return {
                    status: false,
                    data: null,
                    message: error.message
                }
            }
        },
        createShareholderByAdmin: async (__, args) => {
            const uuid = mongoose.Types.ObjectId();
            const { admin_Id, first_Name, last_Name, gender, place_of_Birth, date_of_Birth, national_Id, image_src, image_name, contact, finger_Print } = args.input
            try {
                // Finding admin 
                const Admin = await User.findById(admin_Id).exec();
                if (!Admin)
                    return {
                        message: "Cannot Find Admin!",
                        status: false
                    }
                //    Check strong password 
                if (contact.password.length < 8)
                    return {
                        status: false,
                        message: "The password must be a string with at least 8 characters!"
                    }
                const findShareHolder = await Shareholder.findOne({ "contact.mail": contact.mail });
                const findUser = await User.findOne({ mail: contact.mail });
                if (findUser)
                    return {
                        status: false,
                        message: `This mail: ${contact.mail} has been use by other user!`
                    }
                if (findShareHolder)
                    return {
                        status: false,
                        message: `This mail: ${contact.mail} has been use by other shareholder!`
                    }
                const shareholder = await new Shareholder({
                    first_Name,
                    last_Name,
                    gender,
                    place_of_Birth,
                    date_of_Birth,
                    national_Id,
                    image_src,
                    image_name,
                    position: "shareholder",
                    _id: uuid.toString(),
                    contact: contact,
                    properties: Admin.properties,
                    create_At: new Date().toISOString(),
                    finger_Print: {
                        src: "",
                        name: ""
                    },
                    signatur: {
                        src: "",
                        name: ""
                    }
                }).save();
                if (shareholder)
                    await auth
                        .createUser({
                            uid: uuid.toString(),
                            email: contact.mail,
                            password: contact.password,
                        })
                        .catch((error) => {
                            console.log('Error creating new user:', error);
                        });
                if (shareholder)
                    return {
                        status: true,
                        message: "Shareholder Created!"
                    }
            } catch (err) {
                return {
                    message: err.message,
                    status: false
                }
            }
        },
        updateShareholder: async (__, args) => {
            const { _id, first_Name, last_Name, gender, place_of_Birth, national_Id, image_src, image_name, contact, date_of_Birth, } = args.input;
            try {
                if (!last_Name || !first_Name)
                    return {
                        status: false,
                        data: null,
                        message: "First Name and Last Name is required"
                    }
                const findShareHolder = await Shareholder.findById(_id).exec();

                const updated = await Shareholder.findByIdAndUpdate(
                    _id,
                    {
                        first_Name,
                        last_Name,
                        gender,
                        place_of_Birth,
                        national_Id,
                        image_src,
                        image_name,
                        date_of_Birth,
                        update_At: new Date().toISOString(),
                        contact: {
                            phone_Number: contact.phone_Number,
                            mail: findShareHolder.contact.mail,
                            location: contact.location
                        }
                    }
                ).exec()
                if (updated)
                    return {
                        status: true,
                        data: updated,
                        message: "Shareholder updated!"
                    }
            } catch (error) {
                return {
                    status: false,
                    data: null,
                    message: error.message
                }
            }
        },
        changeMail: async (__, args) => {
            try {
                if (!args.mail)
                    return {
                        status: false,
                        message: "Mail is required"
                    }
                if (!args.password)
                    return {
                        status: false,
                        message: "Password is required"
                    }
                if (args.password.length < 8)
                    return {
                        status: false,
                        message: "The password must be a string with at least 8 characters!"
                    }
                const findShareHolder = await Shareholder.findById(args._id).exec();
                // console.log(findShareHolder.contact.mail)
                const findUser = await User.findOne({ mail: args.mail });
                const otherShareHolderusingSameMail = await Shareholder.findOne({ "contact.mail": args.mail, _id: { $ne: mongoose.Types.ObjectId(args._id) } });
                if (findUser)
                    return {
                        status: false,
                        message: `This mail: ${args.mail} has been use by other user!`
                    }
                if (otherShareHolderusingSameMail)
                    return {
                        status: false,
                        message: `This mail: ${args.mail} has been use by other shareholder!`
                    }

                await auth.deleteUser(args._id).then(async e => {
                    await auth
                        .createUser({
                            uid: args._id,
                            email: args.mail,
                            password: args.password,
                        })
                        .catch((error) => {
                            console.log('Error creating new user:', error);
                        });
                })
                    .catch((error) => {
                        console.log('Error deleting user:', error);
                    });
                const updated = await Shareholder.findByIdAndUpdate(
                    args._id,
                    {
                        contact: {
                            mail: args.mail,
                            phone_Number: findShareHolder.contact.phone_Number,
                            location: findShareHolder.contact.location
                        }
                    }
                ).exec();
                if (updated)
                    return {
                        message: "Mail Changed!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        deleteShareholder: async (__, args) => {
            try {
                const findShareHolder = await Shareholder.findById(args.shareholderId);
                if (!findShareHolder)
                    return {
                        message: "Cannot find shareholder to delete!",
                        status: false
                    };
                if (findShareHolder)
                    await auth.deleteUser(args.shareholderId).catch(error => console.log('Error deleting user:', error));

                const deleteShareholder = await Shareholder.findByIdAndDelete(args.shareholderId).exec();
                if (deleteShareholder) {
                    await SoldOutShare.deleteMany({
                        shareholder: args.shareholderId
                    })
                    return {
                        message: "Shareholder deleted!",
                        status: true
                    };
                }

                if (!deleteShareholder)
                    return {
                        message: "Cannot delete shareholder!",
                        status: false
                    };

            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        addDocShareholder: async (__, args) => {
            const { shareholder_Id, name, display_Name, src } = args.input;
            // console.log(shareholder_Id, name, display_Name, src)
            const uuid = mongoose.Types.ObjectId();

            try {
                const findShareHolder = await Shareholder.findById(shareholder_Id).exec()

                if (!findShareHolder)
                    return {
                        message: "Cannot find shareholder!",
                        status: false
                    };

                const addDoc = await Shareholder.findByIdAndUpdate({
                    _id: shareholder_Id
                }, {
                    $push: {
                        documents: {
                            name: name,
                            display_Name: display_Name,
                            src: src,
                            _id: uuid.toString()
                        }
                    }
                })

                if (addDoc)
                    return {
                        message: "Document Added!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        removeDocShareholder: async (__, args) => {
            // console.log(args)
            try {
                // shareholder_Id: String!, doc_id: String!
                const findDocShareholder = await Shareholder.findOne({
                    "documents._id": mongoose.Types.ObjectId(args.doc_Id)
                });
                if (!findDocShareholder)
                    return {
                        message: "Cannot find document in shareholder!",
                        status: false
                    };
                const removeDoc = await Shareholder.findByIdAndUpdate(
                    args.shareholder_Id
                    , {
                        $pull: {
                            documents: {
                                _id: args.doc_Id
                            }
                        }
                    }
                ).exec();
                if (removeDoc)
                    return {
                        message: "Document Removed!",
                        status: true
                    }

            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        renameDocShareholder: async (__, args) => {
            const { shareholder_Id, doc_Name, doc_Id } = args;
            try {
                const findDocInShareholder = await Shareholder.findOne({
                    "documents._id": mongoose.Types.ObjectId(doc_Id)
                });
                if (!findDocInShareholder)
                    return {
                        message: "Cannot find document in shareholder!",
                        status: false
                    };

                const findShareHolder = await Shareholder.findById(shareholder_Id);
                if (!findShareHolder)
                    return {
                        message: "Cannot find shareholder!",
                        status: false
                    };
                const renamed = await Shareholder.updateOne({
                    "_id": mongoose.Types.ObjectId(shareholder_Id),
                    "documents._id": mongoose.Types.ObjectId(doc_Id)
                }, {
                    "$set": {
                        "documents.$.display_Name": doc_Name,
                    }
                })

                if (renamed)
                    return {
                        message: "Rename success!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        addShareholderProperty: async (__, args) => {
            try {
                if (args.shareholder_Id === "")
                    return {
                        message: "Please fill a valid shareholder!",
                        status: false
                    };
                if (args.property_Id === "")
                    return {
                        message: "Please fill a valid property id!",
                        status: false
                    };

                const findDubplicateProperty = await Shareholder.findOne(
                    {
                        _id: args.shareholder_Id,
                        properties: args.property_Id
                    }
                )
                const findPropery = await Property.findById({
                    _id: args.property_Id
                })

                if (findDubplicateProperty)
                    return {
                        message: "Property Already Added!",
                        status: false
                    };
                if (!findPropery)
                    return {
                        message: "Cannot find Property!",
                        status: false
                    };
                await Property.findByIdAndUpdate({
                    _id: args.property_Id
                }, {
                    $push: {
                        shareholders: {
                            _id: mongoose.Types.ObjectId(args.shareholder_Id)
                        }
                    }
                })
                await Shareholder.findByIdAndUpdate({
                    _id: args.shareholder_Id
                }, {
                    $push: {
                        properties: {
                            _id: mongoose.Types.ObjectId(args.property_Id)
                        }
                    }
                })
                return {
                    message: "Assign success!",
                    status: true
                }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        addFingerPrintShareholder: async (__, args) => {
            try {
                const findShareHolder = await Shareholder.findById(args.shareholder_Id).exec();
                if (!findShareHolder)
                    return {
                        message: "Cannot find shareholder!",
                        status: false
                    }
                const updated = await Shareholder.findByIdAndUpdate(
                    args.shareholder_Id,
                    {
                        finger_Print: {
                            src: args.src,
                            name: args.name
                        }
                    }
                ).exec();
                if (updated)
                    return {
                        message: "Add Finger Print success!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        }
        ,
        addSignaturShareholder: async (__, args) => {
            try {
                const findShareHolder = await Shareholder.findById(args.shareholder_Id).exec();
                if (!findShareHolder)
                    return {
                        message: "Cannot find shareholder!",
                        status: false
                    }
                const updated = await Shareholder.findByIdAndUpdate(
                    args.shareholder_Id,
                    {
                        signatur: {
                            src: args.src,
                            name: args.name
                        }
                    }
                ).exec();
                if (updated)
                    return {
                        message: "Add signatur success!",
                        status: true
                    }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        },
        removeShareHolderProperty: async (__, args) => {
            try {
                await Shareholder.findByIdAndUpdate(
                    args.shareholder_Id, {
                    $pull: {
                        properties: args.property_Id
                    }
                }).exec();
                const findShareholderbyProperty = await Shareholder.findOne(
                    {
                        _id: args.shareholder_Id,
                        properties: args.property_Id
                    }

                ).exec()

                if (!findShareholderbyProperty) {
                    return {
                        message: "Success!",
                        status: true
                    }
                } else {
                    return {
                        message: "Cannot Remove!",
                        status: false
                    }
                }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }
        }

    }
}