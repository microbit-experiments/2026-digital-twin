import { ExternalLinkIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import type { InfoPanelData, InfoPanelMode } from "../types/info-panel";
import { getInfoPanelData } from "../utils/info-panel";

function MakeCodeReferenceFrame({ panel }: { panel: InfoPanelData }) {
  if (!panel.embedUrl) {
    return (
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        bg="gray.50"
        px={4}
        py={4}
      >
        <Text color="gray.600" fontSize="sm">
          Waiting for input from your Micro:bit. Perform an action to see the docs.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      overflow="hidden"
      bg="white"
      boxShadow="0 8px 18px rgba(15, 23, 42, 0.06)"
    >
      <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
        <Heading size="xs" mb={1}>
          MakeCode reference
        </Heading>
        <Text color="gray.600" fontSize="sm">
          Blocks, code examples, and the interactive micro:bit simulator.
        </Text>
      </Box>
      <Box
        as="iframe"
        title={`${panel.title} MakeCode reference`}
        src={panel.embedUrl}
        w="100%"
        h={{ base: "560px", md: "680px" }}
        border={0}
        display="block"
      />
    </Box>
  );
}

export function InfoPanelContent({ mode, locked, lockHandler }: { mode: InfoPanelMode, locked: boolean, lockHandler: () => void }) {
  const panel = getInfoPanelData(mode);

  return (
    <Stack spacing={5} px={{ base: 0, md: 6 }} py={{ base: 0, md: 4 }}>
      <Box display={{ base: "none", md: "block" }}>
        <Flex alignItems="center" justifyContent="space-between" p={4} borderWidth="1px">
          <Heading size="md">
            {panel.title}
          </Heading>
          <IconButton
            aria-label='Search database'
            icon={locked ? <LockIcon /> : <UnlockIcon />}
            size={"sm"}
            colorScheme={locked ? "red" : "gray"}
            onMouseDown={lockHandler}
          />
        </Flex>
        <Divider />
      </Box>

      <Box>
        <Text color="gray.600" fontSize="sm">
          {panel.description}
        </Text>
      </Box>

      <MakeCodeReferenceFrame panel={panel} />

      {panel.docsUrl && (
        <Button
          as="a"
          href={panel.docsUrl}
          target="_blank"
          rel="noreferrer"
          rightIcon={<ExternalLinkIcon />}
          colorScheme="teal"
          variant="outline"
          alignSelf="flex-start"
        >
          Open full docs
        </Button>
      )}
    </Stack>
  );
}
