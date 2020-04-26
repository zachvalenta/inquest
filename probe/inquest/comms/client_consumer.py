import contextlib

from gql import AsyncClient


class ClientConsumer(contextlib.AsyncExitStack):

    def __init__(self):
        super().__init__()
        self._client = None

    def set_client(self, client: AsyncClient):
        self._client = client

    @property
    def client(self) -> AsyncClient:
        if self._client is None:
            raise Exception('consumer wasn\'t given asccess to the client')
        return self._client

    async def main(self):
        raise NotImplementedError()