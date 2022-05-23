const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar DataTime
  type User{
    _id: ID
    user_name: String
    mail: String
    position: String
    image_name: String
    image_src: String
    create_At: DataTime  
    update_At: DataTime 
    status: Boolean
    properties: [Property]
  }
  type getUserMessage{
    status: Boolean
    message: String
    data: User
  }
  type getUsersMessage{
    status: Boolean
    message: String
    data: [User]
  }
  type Paginator {
        slNo: Int
        prev: Int
        next: Int
        perPage: Int
        totalPosts: Int
        totalPages: Int
        currentPage: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
        totalDocs:Int
    }
    type getUsersPaginatorMessage {
        users:[User]
        paginator:Paginator
        message: String
    }
    type userMessage{
      message: String
      status: Boolean
    }
  # input 
  input superAdminInput{
    user_name: String
    mail: String
    password: String
    image_name: String
    image_src: String
  }
  input adminInput{
    user_name: String
    mail: String
    password: String
    image_name: String
    image_src: String
  }
  input adminInputUpdate{
    userId: String
    user_name: String
    image_name: String
    image_src: String
    loginId: String
  }
 
    type Query {
      getuserLogin:  getUserMessage!
      getUsersPagination(page: Int!,limit: Int!,keyword: String!): getUsersPaginatorMessage!
    }
    type Mutation {
      createSuperAdmin(input:  superAdminInput!): getUserMessage!
      createAdmin(input:  adminInput!): getUserMessage!
      deleteAdmin(userId: String!, loginId: String!): userMessage!
      disableAdmin(userId: String!, loginId: String!, status: Boolean!): userMessage
      updateAdmin(input: adminInputUpdate!): userMessage!
      assignProperty(propertyId: String!,userId: String!): userMessage!
      removePropertyFromUser(propertyId: String!,userId: String!): userMessage!
    }
  
`;
