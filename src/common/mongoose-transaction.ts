import { ClientSession, Connection } from 'mongoose';

export async function mongooseTransaction<T>(
  connection: Connection,
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
