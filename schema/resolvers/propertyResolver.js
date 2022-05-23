const Property = require('../models/Property');
const { authCheck } = require("../../helpers/auth");
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = {
    Query: {
        getProperties: async (__, { keyword }, { req }) => {
            await authCheck(req)
            try {
                const property = Property.find({ "name": { $regex: keyword, $options: 'i' } });
                return await property;
            } catch (err) {
                throw new Error(err)
            }
        },
        getProperty: async (__, args) => {
            try {
                const property = await Property.findById(args._id).exec();
                if (property)
                    return {
                        status: true,
                        message: "Get Property Success!",
                        data: property
                    }
                return {
                    status: false,
                    message: "Cannot find Property!",
                    data: null
                }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        getTopCapitalProperties: async (__, args) => {
            try {
                const topProperties = await Property.find().sort({ capital: - 1 }).limit(3).exec();
                if (topProperties)
                    return {
                        status: true,
                        message: "Get Top Property Success!",
                        data: topProperties
                    }
            } catch (err) {
                return {
                    status: false,
                    message: err.message,
                    data: null
                }
            }
        }
    },
    Mutation: {
        createProperty: async (__, args) => {
            try {
                const property = await new Property(args.input).save();
                if (!property)
                    return {
                        status: false,
                        message: "Cannot create Property",
                        data: null
                    }
                return {
                    status: true,
                    message: "Property Created!",
                    data: property
                }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        deleteProperty: async (__, args) => {
            try {
                const findProperty = await Property.findById(mongoose.Types.ObjectId(args.propertyId));
                if (!findProperty)
                    return {
                        message: "Cannot find user to delete!",
                        status: false
                    };

                const findPropertyInuser = await User.find({ properties: args.propertyId });

                await findPropertyInuser.forEach(async e =>

                    await User.updateOne({
                        _id: e._id.toString()
                    }, {
                        $pull: {
                            properties: args.propertyId
                        }
                    })
                )

                await Property.findByIdAndDelete(mongoose.Types.ObjectId(args.propertyId))
                    .exec();
                return {
                    message: "Property Deleted!",
                    status: true
                }
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                }
            }

        },
        updateProperty: async (__, args) => {
            try {
                const findProperty = await Property.findById({ _id: args.input._id });
                if (!findProperty)
                    return {
                        status: true,
                        message: "Cannot find property to update!",
                        data: null
                    }

                const updateProperty = await Property.findByIdAndUpdate(
                    {
                        _id: args.input._id
                    },
                    {
                        name: args.input.name,
                        description: args.input.description,
                        mail: args.input.mail,
                        location: args.input.location,
                        telephone: args.input.telephone,
                        website: args.input.website,
                        capital: args.input.capital,
                        logo: args.input.logo,
                        logoSrc: args.input.logoSrc,
                        update_At: new Date().toISOString()
                    }
                ).exec();
                return {
                    status: true,
                    message: "Property Updated!",
                    data: updateProperty
                }
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        addDocToProperty: async (__, args) => {
            try {
                const property = await Property.findById(args.input.propertyId).exec();
                if (!property)
                    return {
                        message: "Cannot find property!",
                        status: false
                    };

                await Property.findByIdAndUpdate({
                    _id: args.input.propertyId
                }, {
                    $push: {
                        documents: {
                            name: args.input.name,
                            display_Name: args.input.display_Name,
                            src: args.input.src
                        }
                    }
                })

                return {
                    message: "Document Added!",
                    status: true
                }
            } catch (err) {
                return {
                    message: err.message,
                    status: false
                }
            }
        },
        removeDocFromProperty: async (__, args) => {

            try {
                const findDocInproperty = await Property.findOne({
                    "documents._id": mongoose.Types.ObjectId(args.docId)
                });
                const findProperty = await Property.findById(args.propertyId);
                if (!findDocInproperty)
                    return {
                        message: "Cannot find document in property!",
                        status: false
                    };
                if (!findProperty)
                    return {
                        message: "Cannot find property!",
                        status: false
                    };
                await Property.updateOne({
                    _id: args.propertyId
                }, {
                    $pull: {
                        documents: {
                            _id: args.docId
                        }
                    }
                })
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
        renamePropertyDoce: async (__, args) => {
            // console.log(typeof args.propertyId)
            try {
                const findDocInproperty = await Property.findOne({
                    "documents._id": mongoose.Types.ObjectId(args.docId)
                });
                const findProperty = await Property.findById(args.propertyId);
                if (!findDocInproperty)
                    return {
                        message: "Cannot find document in property!",
                        status: false
                    };
                if (!findProperty)
                    return {
                        message: "Cannot find property!",
                        status: false
                    };


                const getPro = await Property.findOneAndUpdate(
                    {
                        _id: args.propertyId,
                        'documents._id': args.docId
                    },
                    {
                        $set: { 'documents.$.display_Name': args.docName },
                    }
                );

                if (getPro)
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
        }
    }
}
