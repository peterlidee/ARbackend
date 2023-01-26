/* eslint-disable */
import { KeystoneContext } from '@keystone-next/types';
import {
  CartItemCreateInput,
  OrderCreateInput,
} from '../.keystone/schema-types';
import stripeConfig from '../lib/stripe';

interface Arguments {
  token: string;
}

const graphql = String.raw;

export default async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // 1. make sure they are signed in
  const userId = context.session.itemId;
  if (!userId) {
    throw new Error('Sorry, you must be logged in to create an order');
  }
  // 1.1 query the user
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
      id
      name
      email
      cart{
        id
        quantity
        product{
          name
          price
          description
          photo{
            id
            image{
              id
              publicUrlTransformed
            }
          }
        }
      }
    `,
  });
  // 2. calculate the total price
  const cartItems = user.cart.filter((cartItem) => cartItem.product);
  const amount = cartItems.reduce(function (
    tally: number,
    cartItem: CartItemCreateInput
  ) {
    return tally + cartItem.quantity * cartItem.product.price;
  }, 0);
  // 3. create the charge with stripe library
  const charge = await stripeConfig.paymentIntents.create({
    amount,
    currency: 'USD',
    confirm: true,
    payment_method: token,
  }).catch(error => {
    console.log(error)
    throw new Error(error.message)
  });
  console.log('charge', charge);
  // 4. convert cartItems to OrderItems
  // 5. create the Order and return it
}
