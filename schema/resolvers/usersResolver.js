const User = require('../models/User');
const Property = require('../models/Property');
const Shareholder = require('../models/Shareholder');
const { authCheck } = require("../../helpers/auth");
const { auth } = require("../../config/firebaseConfig");
const mongoose = require('mongoose');

const userLabels = {
    docs: "users",
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
        getuserLogin: async (__, args, { req }) => {
            const currentUser = await authCheck(req)
            try {
                if (!currentUser.email)
                    return {
                        status: false,
                        message: "Cannot find user!",
                        data: null
                    };
                const admin = await User.findOne(
                    {
                        mail: currentUser.email
                    }
                ).populate('properties').exec();
                const shareholder = await Shareholder.findOne(
                    {
                        'contact.mail': currentUser.email
                    }
                ).populate('properties').exec();

                if (admin)
                    return {
                        status: true,
                        message: "User logined!",
                        data: admin
                    };
                if (shareholder)
                    return {
                        status: true,
                        message: "Shareholder logined!",
                        data: {
                            properties: shareholder.properties,
                            position: shareholder.position,
                            image_src: shareholder.image_src,
                            user_name: shareholder.first_Name + " " + shareholder.last_Name
                        }
                    };

            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                };
            }
        },

        getUsersPagination: async (__, args) => {
            const options = {
                page: args.page || 1,
                limit: args.limit || 10,
                customLabels: userLabels,
                sort: {
                    createdAt: -1,
                },
                populate: "properties",
            }
            const query = {
                $or: [
                    { user_name: { $regex: args.keyword, $options: "i" } },
                ],
            }
            const users = await User.paginate(query, options);
            return users;

        }
    },
    Mutation: {
        createSuperAdmin: async (__, args) => {
            const uuid = mongoose.Types.ObjectId();
            const { user_name, mail, password } = args.input;
            try {
                if (user_name == "")
                    return {
                        status: false,
                        message: "Please fill a valid username!",
                        data: null
                    }
                if (mail == "")
                    return {
                        status: false,
                        message: "Please fill a valid mail!",
                        data: null
                    }
                if (password == "")
                    return {
                        status: false,
                        message: "Please fill a valid password!",
                        data: null
                    }

                if (password.length < 8)
                    return {
                        status: false,
                        message: "The password must be a string with at least 6 characters!",
                        data: null
                    }

                const superAdmin = await new User(
                    {
                        ...args.input,
                        position: "superAdmin",
                        _id: uuid.toString()
                    }
                ).save();
                if (superAdmin)
                    await auth
                        .createUser({
                            uid: uuid.toString(),
                            email: args.input.mail,
                            password: args.input.password,
                        })
                        .catch((error) => {
                            console.log('Error creating new user:', error);
                        });
                return {
                    status: true,
                    message: "User Created!",
                    data: superAdmin
                };
            } catch (err) {
                return {
                    status: true,
                    message: err.message,
                    data: null
                };

            }
        },
        createAdmin: async (__, args) => {
            const uuid = mongoose.Types.ObjectId();
            const { user_name, mail, password } = args.input;

            try {
                if (user_name == "")
                    return {
                        status: false,
                        message: "Please fill a valid username!",
                        data: null
                    }

                if (mail == "")
                    return {
                        status: false,
                        message: "Please fill a valid mail!",
                        data: null
                    }
                if (password == "")
                    return {
                        status: false,
                        message: "Please fill a valid password!",
                        data: null
                    }

                if (password.length < 8)
                    return {
                        status: false,
                        message: "The password must be a string with at least 6 characters!",
                        data: null
                    }
                const admin = await new User(
                    {
                        ...args.input,
                        position: "admin",
                        _id: uuid.toString()
                    }
                ).save();

                if (admin)
                    await auth
                        .createUser({
                            uid: uuid.toString(),
                            email: args.input.mail,
                            password: args.input.password,
                        })
                        .catch((error) => {
                            console.log('Error creating new user:', error);
                        });

                return {
                    status: true,
                    message: "User Created!",
                    data: admin
                };
            } catch (error) {
                return {
                    status: false,
                    message: error.message,
                    data: null
                }
            }
        },
        deleteAdmin: async (__, args) => {
            const { userId, loginId } = args;
            try {
                if (userId === loginId) {
                    return {
                        message: "You can't delete yourself",
                        status: false
                    };
                }

                const findUer = await User.findById(args.userId);
                if (!findUer)
                    return {
                        message: "Cannot find user to delete!",
                        status: false
                    };
                await User.deleteOne({ _id: args.userId });
                await auth.deleteUser(userId)
                    .catch((error) => {
                        console.log('Error deleting user:', error);
                    });

                return {
                    message: "Admin deleted!",
                    status: true
                };
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                };
            }
        },
        disableAdmin: async (__, args) => {
            const { userId, loginId, status } = args;
            try {
                if (userId === loginId) {
                    return {
                        message: "You can't disable yourself!",
                        status: true
                    };
                }
                if (userId == "")
                    return {
                        message: "Please fill a valid user id!",
                        status: true
                    };
                if (loginId == "")
                    return {
                        message: "Please fill a valid user login id!",
                        status: true
                    };
                const findUer = await User.findById(args.userId);
                if (!findUer)
                    return {
                        message: "Cannot find user to disable!",
                        status: true
                    };

                const user = await User.findByIdAndUpdate(
                    args.userId,
                    { status: status ? false : true }
                );
                if (user.status)
                    return {
                        message: "Admin enabled!",
                        status: false
                    }

                if (!user.status)
                    return {
                        message: "Admin disabled!",
                        status: true
                    }

            } catch (error) {
                return error.message
            }
        },
        updateAdmin: async (__, args) => {
            try {
                if (args.input.userId === args.input.loginId)
                    return {
                        message: "You can't update yourself!",
                        status: false
                    };

                const findUser = await User.findById(args.input.userId);
                console.log(findUser)
                if (!findUser)
                    return {
                        message: "Cannot find user to update!",
                        status: false
                    };

                await User.findByIdAndUpdate({ _id: args.input.userId }, {
                    user_name: args.input.user_name,
                    image_name: args.input.image_name,
                    image_src: args.input.image_src,
                    update_At: new Date().toISOString()
                });
                return {
                    message: "User Updated!",
                    status: true
                };
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                };
            }
        },
        assignProperty: async (__, args) => {
            try {
                if (args.userId === "")
                    return {
                        message: "Please fill a valid user id!",
                        status: false
                    };
                if (args.propertyId === "")
                    return {
                        message: "Please fill a valid property id!",
                        status: false
                    };

                const findDubplicateProperty = await User.findOne(
                    {
                        _id: args.userId,
                        properties: args.propertyId
                    }
                )
                const findPropery = await Property.findById({
                    _id: args.propertyId
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
                await User.findByIdAndUpdate({
                    _id: args.userId
                }, {
                    $push: {
                        properties: {
                            _id: mongoose.Types.ObjectId(args.propertyId)
                        }
                    }
                })
                return {
                    message: "Assign success!",
                    status: true
                };
            } catch (error) {
                return {
                    message: error.message,
                    status: false
                };
            }
        },
        removePropertyFromUser: async (__, args) => {
            try {
                if (args.userId === "")
                    return {
                        message: "Please fill a valid user id!",
                        status: false
                    };
                if (args.propertyId === "")
                    return {
                        message: "Please fill a valid property id!",
                        status: false
                    };
                const findUser = await User.findById({
                    _id: args.userId
                })
                if (!findUser)
                    return {
                        message: "Cannot find User!",
                        status: false
                    };
                await User.updateOne({
                    _id: args.userId
                }, {
                    $pull: {
                        properties: args.propertyId
                    }
                })

                return {
                    message: "Remove property success!",
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