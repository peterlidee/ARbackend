import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log('adding to cart');

  // 1. Query current user and see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this');
  }

  // 2. Query current users cart
  // use findMany because the fields we query are not unique, you can only findOne when the fields are unique - ? wes said
  const allCartItems = await context.lists.CartItem.findMany({
    where: {
      user: { id: sesh.itemId },
      product: { id: productId },
    },
    resolveFields: 'id,quantity',
  });
  const [existingCartItem] = allCartItems;

  // 3. See if the current item is in their cart
  if (existingCartItem) {
    // 4. if it is, +1
    console.log(`Already in cart ${existingCartItem.quantity}, increment by 1`);
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // 5. else create new cartItem
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
    resolveFields: false,
  });
}
